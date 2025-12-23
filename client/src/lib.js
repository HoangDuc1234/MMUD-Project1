"use strict";

/**
 * Converts a plaintext string into a buffer for use in SubtleCrypto functions.
 * @param {string} str - A plaintext string
 * @returns {Uint8Array} A buffer representation for use in SubtleCrypto functions
 */
function stringToBuffer(str) {
    return new TextEncoder().encode(str);
}

/**
 * Converts a buffer object representing string data back into a string
 * @param {BufferSource} buf - A buffer containing string data
 * @returns {string} The original string
 */
function bufferToString(buf) {
    return new TextDecoder().decode(buf);
}

/**
 * Converts a buffer to a Base64 string which can be used as a key in a map and
 * can be easily serialized.
 * @param {BufferSource} buf - A buffer-like object
 * @returns {string} A Base64 string representing the bytes in the buffer
 */
function encodeBuffer(buf) {
    let binary = '';
    const bytes = new Uint8Array(buf);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * Converts a Base64 string back into a buffer
 * @param {string} base64 - A Base64 string representing a buffer
 * @returns {Uint8Array} A Buffer object
 */
function decodeBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

/**
 * Generates a buffer of random bytes
 * @param {number} len - The number of random bytes
 * @returns {Uint8Array} A buffer of `len` random bytes
 */
function getRandomBytes(len) {
    return window.crypto.getRandomValues(new Uint8Array(len))
}

export {
    stringToBuffer,
    bufferToString,
    encodeBuffer,
    decodeBuffer,
    getRandomBytes
}
