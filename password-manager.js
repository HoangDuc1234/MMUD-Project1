"use strict";

/********* External Imports ********/

const {
  stringToBuffer,
  bufferToString,
  encodeBuffer,
  decodeBuffer,
  getRandomBytes,
} = require("./lib");
const { subtle } = require("crypto").webcrypto;

/********* Constants ********/

const PBKDF2_ITERATIONS = 100000; // number of iterations for PBKDF2 algorithm
const MAX_PASSWORD_LENGTH = 64; // we can assume no password is longer than this many characters
const HMAC_KEY_INFO = "mac key";
const AES_KEY_INFO = "encryption key";

/********* Implementation ********/
class Keychain {
  /**
   * Initializes the keychain using the provided information. Note that external
   * users should likely never invoke the constructor directly and instead use
   * either Keychain.init or Keychain.load.
   * Arguments:
   *  You may design the constructor with any parameters you would like.
   * Return Type: void
   */
  constructor(encryptionKey, macKey, kvs, salt) {
    this.data = {
      kvs: kvs || {},
      salt: salt,
    };
    this.secrets = {
      encryptionKey: encryptionKey,
      macKey: macKey,
    };
  }

  static async #deriveKeys(password, salt) {
    const passwordBuffer = stringToBuffer(password);
    const baseKey = await subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const pbkdf2Key = await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      baseKey,
      { name: "HMAC", hash: "SHA-256", length: 256 },
      true,
      ["sign"]
    );

    const macKeyMaterial = await subtle.sign(
      "HMAC",
      pbkdf2Key,
      stringToBuffer(HMAC_KEY_INFO)
    );
    const macKey = await subtle.importKey(
      "raw",
      macKeyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      true,
      ["sign", "verify"]
    );

    const encryptionKeyMaterial = await subtle.sign(
      "HMAC",
      pbkdf2Key,
      stringToBuffer(AES_KEY_INFO)
    );
    const encryptionKey = await subtle.importKey(
      "raw",
      encryptionKeyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    return { macKey, encryptionKey };
  }

  /**
   * Creates an empty keychain with the given password.
   *
   * Arguments:
   *   password: string
   * Return Type: void
   */
  static async init(password) {
    const salt = getRandomBytes(16);
    const { macKey, encryptionKey } = await Keychain.#deriveKeys(
      password,
      salt
    );
    return new Keychain(encryptionKey, macKey, {}, salt);
  }

  /**
   * Loads the keychain state from the provided representation (repr).
   *
   * Arguments:
   *   password:           string
   *   repr:               string
   *   trustedDataCheck: string
   * Return Type: Keychain
   */
  static async load(password, repr, trustedDataCheck) {
    const data = JSON.parse(repr);
    const salt = decodeBuffer(data.salt);

    if (trustedDataCheck !== undefined) {
      const checksum = await subtle.digest("SHA-256", stringToBuffer(repr));
      if (encodeBuffer(checksum) !== trustedDataCheck) {
        throw new Error(
          "Checksum validation failed: Rollback attack detected."
        );
      }
    }

    const { macKey, encryptionKey } = await Keychain.#deriveKeys(
      password,
      salt
    );

    // Verify password by attempting to decrypt a known value (the iv, now used as a password canary)
    try {
      const iv = decodeBuffer(data.iv);
      const canary = decodeBuffer(data.canary);
      await subtle.decrypt({ name: "AES-GCM", iv }, encryptionKey, canary);
    } catch (e) {
      throw new Error("Invalid master password.");
    }

    return new Keychain(encryptionKey, macKey, data.kvs, salt);
  }

  /**
   * Returns a JSON serialization of the contents of the keychain.
   *
   * Return Type: array
   */
  async dump() {
    const iv = getRandomBytes(12);
    const canary = await subtle.encrypt(
      { name: "AES-GCM", iv },
      this.secrets.encryptionKey,
      stringToBuffer("password-ok")
    );

    const data = {
      kvs: this.data.kvs,
      salt: encodeBuffer(this.data.salt),
      iv: encodeBuffer(iv),
      canary: encodeBuffer(canary),
    };

    const repr = JSON.stringify(data);
    const checksum = await subtle.digest("SHA-256", stringToBuffer(repr));

    return [repr, encodeBuffer(checksum)];
  }

  /**
   * Inserts the domain and associated data into the KVS.
   *
   * Arguments:
   *   name: string
   *   value: string
   * Return Type: void
   */
  async set(name, value) {
    const hmacNameBuffer = await subtle.sign(
      "HMAC",
      this.secrets.macKey,
      stringToBuffer(name)
    );
    const hmacName = encodeBuffer(hmacNameBuffer);

    const paddedValue = value.padEnd(MAX_PASSWORD_LENGTH, "\0");
    const iv = getRandomBytes(12);

    const encryptedValue = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
        additionalData: hmacNameBuffer,
      },
      this.secrets.encryptionKey,
      stringToBuffer(paddedValue)
    );

    this.data.kvs[hmacName] =
      encodeBuffer(iv) + "." + encodeBuffer(encryptedValue);
  }

  /**
   * Fetches the data (as a string) corresponding to the given domain from the KVS.
   *
   * Arguments:
   *   name: string
   * Return Type: Promise<string>
   */
  async get(name) {
    const hmacNameBuffer = await subtle.sign(
      "HMAC",
      this.secrets.macKey,
      stringToBuffer(name)
    );
    const hmacName = encodeBuffer(hmacNameBuffer);

    const storedValue = this.data.kvs[hmacName];
    if (!storedValue) {
      return null;
    }

    const [ivEncoded, encryptedValueEncoded] = storedValue.split(".");
    const iv = decodeBuffer(ivEncoded);
    const encryptedValue = decodeBuffer(encryptedValueEncoded);

    try {
      const decryptedBuffer = await subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
          additionalData: hmacNameBuffer,
        },
        this.secrets.encryptionKey,
        encryptedValue
      );

      const decryptedValue = bufferToString(decryptedBuffer);
      return decryptedValue.split("\0")[0];
    } catch (e) {
      throw new Error(
        "Decryption failed: Data may have been tampered with (swap attack)."
      );
    }
  }

  /**
   * Removes the record with name from the password manager.
   *
   * Arguments:
   *   name: string
   * Return Type: Promise<boolean>
   */
  async remove(name) {
    const hmacName = encodeBuffer(
      await subtle.sign("HMAC", this.secrets.macKey, stringToBuffer(name))
    );
    if (this.data.kvs[hmacName]) {
      delete this.data.kvs[hmacName];
      return true;
    }
    return false;
  }
}

module.exports = { Keychain };
