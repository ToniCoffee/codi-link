// https://stackoverflow.com/questions/6226189/how-to-convert-a-string-to-bytearray
export function strToUtf16Bytes(str) {
  const bytes = [];
  for (ii = 0; ii < str.length; ii++) {
    const code = str.charCodeAt(ii); // x00-xFFFF
    bytes.push(code & 255, code >> 8); // low, high
  }
  return bytes;
}

/**
 * Convert a string to a unicode byte array
 * @param {string} str
 * @return {Array} of bytes
 */
export function strToUtf8Bytes(str) {
  const utf8 = [];
  for (let ii = 0; ii < str.length; ii++) {
    let charCode = str.charCodeAt(ii);
    if (charCode < 0x80) utf8.push(charCode);
    else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
    } else {
      ii++;
      // Surrogate pair:
      // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and
      // splitting the 20 bits of 0x0-0xFFFFF into two halves
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
      utf8.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f),
      );
    }
  }
  return utf8;
}

// https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
// Don't use it with UNICODE strings, 
// it will cause a Character Out Of Range exception if a character exceeds the range of a 8-bit ASCII-encoded character
export function encodeBase64(text = '') {
  return window.btoa(text) || '';
}

// Don't use it with UNICODE strings, 
// it will cause a Character Out Of Range exception if a character exceeds the range of a 8-bit ASCII-encoded character
export function decodeBase64(base64Text = '') {
  return window.atob(base64Text) || '';
}

// Solution 1 – escaping the string before encoding it, for work with UNICODE strings
// https://developer.mozilla.org/en-US/docs/Glossary/Base64#Solution_2_%E2%80%93_rewrite_the_DOMs_atob()_and_btoa()_using_JavaScript's_TypedArrays_and_UTF-8
// DEPRECATED - TODO - FIND OTHER SOLUTIOM
export function utf8_to_b64(str) {
  return window.btoa(window.unescape(encodeURIComponent(str)));
}

// Solution 1 – escaping the string before encoding it, for work with UNICODE strings
// DEPRECATED - TODO - FIND OTHER SOLUTIOM
export function b64_to_utf8(str) {
  return decodeURIComponent(window.escape(window.atob(str)));
}