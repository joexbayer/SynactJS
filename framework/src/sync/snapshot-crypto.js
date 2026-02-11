import { fail } from "../errors.js";

const DEFAULT_KDF_ITERATIONS = 210000;
const DEFAULT_ALGORITHM = "AES-GCM";
const SALT_BYTES = 16;
const IV_BYTES = 12;

function getCryptoImpl(preferredImpl = null) {
    const cryptoImpl = preferredImpl || globalThis.crypto;
    if (!cryptoImpl || typeof cryptoImpl.getRandomValues !== "function" || !cryptoImpl.subtle) {
        fail("S013", "Web Crypto APIs are required for sync encryption.", {
            context: "sync.crypto.getCrypto"
        });
    }
    return cryptoImpl;
}

function toBase64(uint8Value) {
    if (!(uint8Value instanceof Uint8Array)) {
        return "";
    }

    if (typeof Buffer !== "undefined") {
        return Buffer.from(uint8Value).toString("base64");
    }

    let binary = "";
    for (const value of uint8Value) {
        binary += String.fromCharCode(value);
    }

    if (typeof btoa === "function") {
        return btoa(binary);
    }

    fail("S013", "Unable to encode base64 in this environment.", {
        context: "sync.crypto.toBase64"
    });
}

function fromBase64(base64Value) {
    if (typeof base64Value !== "string" || !base64Value) {
        return new Uint8Array();
    }

    if (typeof Buffer !== "undefined") {
        return new Uint8Array(Buffer.from(base64Value, "base64"));
    }

    if (typeof atob === "function") {
        const binary = atob(base64Value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    fail("S013", "Unable to decode base64 in this environment.", {
        context: "sync.crypto.fromBase64"
    });
}

function safeStringify(value) {
    try {
        return JSON.stringify(value);
    } catch (error) {
        fail("S016", "Unable to serialize encrypted snapshot payload.", {
            context: "sync.crypto.stringify"
        }, error);
    }
}

function safeParseJSON(rawValue) {
    try {
        return JSON.parse(rawValue);
    } catch (error) {
        fail("S016", "Unable to parse decrypted snapshot payload.", {
            context: "sync.crypto.parse"
        }, error);
    }
}

function normalizeAad(aad) {
    if (aad == null) return null;
    const text = typeof aad === "string" ? aad : safeStringify(aad);
    return new TextEncoder().encode(text);
}

export class SnapshotCrypto {
    constructor(config = {}) {
        this.kdfIterations = Number(config.kdfIterations || DEFAULT_KDF_ITERATIONS);
        this.kdfHash = config.kdfHash || "SHA-256";
        this.algorithm = config.algorithm || DEFAULT_ALGORITHM;
        this.cryptoImpl = config.cryptoImpl || null;
    }

    randomBytes(length) {
        const cryptoImpl = getCryptoImpl(this.cryptoImpl);
        const bytes = new Uint8Array(length);
        cryptoImpl.getRandomValues(bytes);
        return bytes;
    }

    async deriveKey(passphrase, saltBase64 = null) {
        const safePassphrase = String(passphrase || "");
        if (!safePassphrase) {
            fail("S016", "A non-empty passphrase is required for sync encryption.", {
                context: "sync.crypto.deriveKey"
            });
        }

        const cryptoImpl = getCryptoImpl(this.cryptoImpl);
        const subtle = cryptoImpl.subtle;
        const salt = saltBase64 ? fromBase64(saltBase64) : this.randomBytes(SALT_BYTES);

        const passphraseBytes = new TextEncoder().encode(safePassphrase);
        const keyMaterial = await subtle.importKey(
            "raw",
            passphraseBytes,
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const key = await subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: this.kdfIterations,
                hash: this.kdfHash
            },
            keyMaterial,
            { name: this.algorithm, length: 256 },
            false,
            ["encrypt", "decrypt"]
        );

        return {
            key,
            salt,
            saltBase64: toBase64(salt)
        };
    }

    async encryptObject(value, { passphrase, aad = null } = {}) {
        const safePassphrase = String(passphrase || "");
        if (!safePassphrase) {
            fail("S016", "encryptObject requires a passphrase.", {
                context: "sync.crypto.encrypt"
            });
        }

        const cryptoImpl = getCryptoImpl(this.cryptoImpl);
        const subtle = cryptoImpl.subtle;
        const { key, saltBase64 } = await this.deriveKey(safePassphrase);
        const iv = this.randomBytes(IV_BYTES);

        const plaintext = new TextEncoder().encode(safeStringify(value));
        const additionalData = normalizeAad(aad);

        const ciphertextBuffer = await subtle.encrypt(
            {
                name: this.algorithm,
                iv,
                additionalData
            },
            key,
            plaintext
        );

        return {
            version: 1,
            alg: this.algorithm,
            kdf: {
                name: "PBKDF2",
                hash: this.kdfHash,
                iterations: this.kdfIterations,
                salt: saltBase64
            },
            iv: toBase64(iv),
            ciphertext: toBase64(new Uint8Array(ciphertextBuffer))
        };
    }

    async decryptObject(envelope, { passphrase, aad = null } = {}) {
        if (!envelope || typeof envelope !== "object") {
            fail("S016", "decryptObject requires an encrypted envelope object.", {
                context: "sync.crypto.decrypt"
            });
        }

        const safePassphrase = String(passphrase || "");
        if (!safePassphrase) {
            fail("S016", "decryptObject requires a passphrase.", {
                context: "sync.crypto.decrypt"
            });
        }

        const salt = envelope?.kdf?.salt;
        if (typeof salt !== "string" || !salt) {
            fail("S016", "Encrypted envelope is missing kdf.salt.", {
                context: "sync.crypto.decrypt"
            });
        }

        const iv = fromBase64(envelope.iv || "");
        const ciphertext = fromBase64(envelope.ciphertext || "");

        const cryptoImpl = getCryptoImpl(this.cryptoImpl);
        const subtle = cryptoImpl.subtle;
        const { key } = await this.deriveKey(safePassphrase, salt);
        const additionalData = normalizeAad(aad);

        let plaintextBuffer;
        try {
            plaintextBuffer = await subtle.decrypt(
                {
                    name: envelope.alg || this.algorithm,
                    iv,
                    additionalData
                },
                key,
                ciphertext
            );
        } catch (error) {
            fail("S016", "Unable to decrypt sync payload. Passphrase may be invalid.", {
                context: "sync.crypto.decrypt"
            }, error);
        }

        const plaintext = new TextDecoder().decode(plaintextBuffer);
        return safeParseJSON(plaintext);
    }
}

export function createSnapshotCrypto(config = {}) {
    return new SnapshotCrypto(config);
}
