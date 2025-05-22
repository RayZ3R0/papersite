/** 
 * Custom URL-safe character set for encoding
 */
const ENCODING_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

interface SignedRequest {
  timestamp: number;
  token: string;
  signature: string;
}

interface SecureResponse {
  v: string;    // Version
  d: string;    // Encrypted data
  n: string;    // Nonce
  t: number;    // Timestamp
  h: string;    // Hash
  s: string;    // Salt
}

/**
 * Convert array to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to array
 */
function hexToArray(hex: string): Uint8Array {
  const pairs = hex.match(/[\dA-F]{2}/gi) || [];
  return new Uint8Array(
    pairs.map(pair => parseInt(pair, 16))
  );
}

/**
 * Encode bytes to custom base64
 */
function encode(data: Uint8Array): string {
  let result = '';
  let bits = 0;
  let value = 0;

  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 6) {
      const index = (value >> (bits - 6)) & 0x3F;
      result += ENCODING_CHARS[index];
      bits -= 6;
    }
  }

  if (bits > 0) {
    value <<= (6 - bits);
    result += ENCODING_CHARS[value & 0x3F];
  }

  return result;
}

/**
 * Decode from custom base64
 */
function decode(str: string): Uint8Array {
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of str) {
    const index = ENCODING_CHARS.indexOf(char);
    if (index === -1) continue;
    
    value = (value << 6) | index;
    bits += 6;
    
    if (bits >= 8) {
      bytes.push((value >> (bits - 8)) & 0xFF);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

export function generateRequestToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return bufferToHex(array.buffer);
}

export async function signRequest(token: string, timestamp: number): Promise<string> {
  const key = process.env.NEXT_PUBLIC_API_SIGNATURE_KEY;
  if (!key) throw new Error('API signature key is not set');

  const message = `${token}:${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const keyData = encoder.encode(key);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    data
  );
  
  return bufferToHex(signature);
}

export async function verifyRequestSignature(
  token: string,
  timestamp: number,
  signature: string
): Promise<boolean> {
  try {
    const expected = await signRequest(token, timestamp);
    const actual = hexToArray(signature);
    const expectedArray = hexToArray(expected);
    
    if (actual.length !== expectedArray.length) return false;
    return actual.every((byte, i) => byte === expectedArray[i]);
  } catch {
    return false;
  }
}

export function isTimestampValid(timestamp: number, windowMs: number = 30000): boolean {
  const now = Date.now();
  return Math.abs(now - timestamp) <= windowMs;
}

export async function createSignedRequest(): Promise<SignedRequest> {
  const token = generateRequestToken();
  const timestamp = Date.now();
  const signature = await signRequest(token, timestamp);

  return { token, timestamp, signature };
}

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

export async function encryptResponse(data: any): Promise<string> {
  try {
    const key = process.env.NEXT_PUBLIC_API_SIGNATURE_KEY;
    if (!key) throw new Error('API signature key is not set');

    // Generate IV and derive key
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
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
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Encrypt data
    const jsonStr = JSON.stringify(data);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoder.encode(jsonStr)
    );

    // Create hash of the encrypted data
    const hash = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array(encrypted)
    );

    // Build secure response
    const response: SecureResponse = {
      v: '2',
      d: encode(new Uint8Array(encrypted)),
      n: encode(iv),
      t: Date.now(),
      h: bufferToHex(hash),
      s: encode(salt)
    };

    return encode(encoder.encode(JSON.stringify(response)));
  } catch (error) {
    console.error('Encryption failed:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      keyAvailable: !!process.env.NEXT_PUBLIC_API_SIGNATURE_KEY
    });
    throw new Error(
      error instanceof Error
        ? `Failed to encrypt response: ${error.message}`
        : 'Failed to encrypt response'
    );
  }
}

export async function decryptResponse(encoded: string): Promise<any> {
  try {
    const key = process.env.NEXT_PUBLIC_API_SIGNATURE_KEY;
    if (!key) throw new Error('API signature key is not set');

    // Decode wrapper
    const decoder = new TextDecoder();
    const wrapperBytes = decode(encoded);
    const wrapper: SecureResponse = JSON.parse(decoder.decode(wrapperBytes));

    // Verify timestamp
    if (Math.abs(Date.now() - wrapper.t) > 30000) {
      throw new Error('Response expired');
    }

    // Decode encrypted data and IV
    const encryptedData = decode(wrapper.d);
    const iv = decode(wrapper.n);

    // Verify hash
    const hash = await crypto.subtle.digest('SHA-256', encryptedData);
    if (bufferToHex(hash) !== wrapper.h) {
      throw new Error('Data integrity check failed');
    }

    // Decode salt and derive key
    const salt = decode(wrapper.s);
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
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encryptedData
    );

    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    // Log detailed error info
    console.error('Decryption failed:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      wrapper: wrapper?.v, // Log version if available
      keyAvailable: !!process.env.NEXT_PUBLIC_API_SIGNATURE_KEY,
      timestamp: wrapper?.t
    });

    // Throw specific error messages
    if (error instanceof Error) {
      if (error.message === 'Response expired') {
        throw new Error('Response has expired. Please try again.');
      }
      if (error.message === 'Data integrity check failed') {
        throw new Error('Response data appears to be tampered with.');
      }
      throw new Error(`Decryption failed: ${error.message}`);
    }

    throw new Error('Failed to decrypt response');
  }
}