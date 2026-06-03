import crypto from "node:crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

export async function hashPwd(pwd) {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const derivedKey = await scryptAsync(pwd, salt, KEY_LENGTH);
    return `${salt}:${derivedKey.toString('hex')}`;
}

export async function checkPwd(pwd, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const derivedKey = await scryptAsync(pwd, salt, KEY_LENGTH);
    const candidateHash = derivedKey.toString('hex');

    return crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(candidateHash, 'hex')
    );
}

function scryptAsync(pwd, salt, keyLen) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(pwd, salt, keyLen, SCRYPT_PARAMS, (err, key) => {
            if (err) reject(err);
            else resolve(key);
        });
    });
}
