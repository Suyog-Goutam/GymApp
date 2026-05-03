/* DammiGYM — Crypto Module
   XOR cipher + Base64 for data obfuscation
   SHA-256 via SubtleCrypto for password hashing */
window.DG = window.DG || {};

DG.Crypto = (() => {
  const SECRET = 'DammiGYM_2026_SecretKey!@#';

  // XOR encrypt then Base64 encode
  function encrypt(text, key) {
    key = key || SECRET;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(unescape(encodeURIComponent(result)));
  }

  // Base64 decode then XOR decrypt
  function decrypt(encoded, key) {
    key = key || SECRET;
    try {
      const text = decodeURIComponent(escape(atob(encoded)));
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (e) {
      console.error('Decryption failed:', e);
      return null;
    }
  }

  // SHA-256 hash (async, uses SubtleCrypto)
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + SECRET);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Generate UUID v4
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  return { encrypt, decrypt, hashPassword, uuid };
})();
