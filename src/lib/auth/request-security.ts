/**
 * Encodes a Uint8Array to base64 string
 */
function encodeBase64(data: Uint8Array): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    return btoa(String.fromCharCode.apply(null, Array.from(data)));
  } else {
    // Node.js environment
    return Buffer.from(data).toString('base64');
  }
}

/**
 * Decodes a base64 string to Uint8Array
 */
function decodeBase64(base64: string): Uint8Array {
  if (typeof window !== 'undefined') {
    // Browser environment
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } else {
    // Node.js environment
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
}

/**
 * Interface for signed API requests
 */
interface SignedRequest {
  timestamp: number;
  token: string;
  signature: string;
}

/**
 * Wrapper for sensitive response data
 */
interface SecureResponse {
  v: string;  // Version
  d: string;  // Encrypted data
  n: string;  // Nonce
  t: number;  // Timestamp
}

/**
 * Converts ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts hex string to Uint8Array
 */
function hexToArray(hex: string): Uint8Array {
  const pairs = hex.match(/[\dA-F]{2}/gi) || [];
  return new Uint8Array(
    pairs.map(pair => parseInt(pair, 16))
  );
}

/**
 * Generates a secure random request token using Web Crypto API
 */
export function generateRequestToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return bufferToHex(array.buffer);
}

/**
 * Signs a request using HMAC-SHA256 with Web Crypto API
 */
export async function signRequest(token: string, timestamp: number): Promise<string> {
  const signingKey = process.env.NEXT_PUBLIC_API_SIGNATURE_KEY;

  if (!signingKey) {
    throw new Error('NEXT_PUBLIC_API_SIGNATURE_KEY is not set');
  }

  const message = `${token}:${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const keyData = encoder.encode(signingKey);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    data
  );
  
  return bufferToHex(signature);
}

/**
 * Verifies a request signature using Web Crypto API
 */
export async function verifyRequestSignature(
  token: string,
  timestamp: number,
  signature: string
): Promise<boolean> {
  try {
    const expectedSignature = await signRequest(token, timestamp);
    const signatureArray = hexToArray(signature);
    const expectedArray = hexToArray(expectedSignature);
    
    if (signatureArray.length !== expectedArray.length) {
      return false;
    }
    
    return signatureArray.every((byte, i) => byte === expectedArray[i]);
  } catch {
    return false;
  }
}

/**
 * Checks if a request timestamp is within allowed window
 */
export function isTimestampValid(timestamp: number, windowMs: number = 30000): boolean {
  const now = Date.now();
  return Math.abs(now - timestamp) <= windowMs;
}

/**
 * Creates a signed request object
 */
export async function createSignedRequest(): Promise<SignedRequest> {
  const token = generateRequestToken();
  const timestamp = Date.now();
  const signature = await signRequest(token, timestamp);

  return {
    token,
    timestamp,
    signature
  };
}

/**
 * Validates a signed request
 */
export async function validateSignedRequest(
  token: string,
  timestamp: number,
  signature: string,
  windowMs: number = 30000
): Promise<boolean> {
  try {
    return (
      isTimestampValid(timestamp, windowMs) &&
      await verifyRequestSignature(token, timestamp, signature)
    );
  } catch (error) {
    console.error('Request validation failed:', error);
    return false;
  }
}

/**
 * Encrypts response data with additional security layers
 */
export async function encryptResponse(data: any): Promise<string> {
  const key = process.env.NEXT_PUBLIC_API_SIGNATURE_KEY;
  if (!key) {
    throw new Error('API signature key is not set');
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const cryptoKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('papernexus-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // First encryption layer
  const jsonStr = JSON.stringify(data);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(jsonStr)
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + new Uint8Array(encryptedData).length);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);

  // Create secure wrapper
  const wrapper: SecureResponse = {
    v: '1',
    d: encodeBase64(combined),
    n: encodeBase64(iv),
    t: Date.now()
  };

  return encodeBase64(encoder.encode(JSON.stringify(wrapper)));
}

/**
 * Decrypts response data using derived key
 */
export async function decryptResponse(encryptedData: string): Promise<any> {
  try {
    const key = process.env.NEXT_PUBLIC_API_SIGNATURE_KEY;
    if (!key) {
      throw new Error('API signature key is not set');
    }

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const cryptoKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('papernexus-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decoder = new TextDecoder();
    const wrapperData = decoder.decode(decodeBase64(encryptedData));
    const wrapper: SecureResponse = JSON.parse(wrapperData);

    if (Math.abs(Date.now() - wrapper.t) > 30000) {
      throw new Error('Response expired');
    }

    const combined = decodeBase64(wrapper.d);
    const iv = decodeBase64(wrapper.n);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );

    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt response');
  }
}