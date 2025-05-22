/**
 * Encodes a Uint8Array to base64 string
 */
export function encodeBase64(data: Uint8Array): string {
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
export function decodeBase64(base64: string): Uint8Array {
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