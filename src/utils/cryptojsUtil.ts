// src/utils/cryptojsUtil.ts
import CryptoJS from 'crypto-js';

export function randomBytesBase64(len = 32): string {
  // len = number of random bytes
  const wa = CryptoJS.lib.WordArray.random(len);
  return CryptoJS.enc.Base64.stringify(wa);
}