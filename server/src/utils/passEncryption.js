
const crypto = require("node:crypto");

const ALGORITHM = "aes-256-gcm";

const getEncryptionKey = () => {
  const keyHex = process.env.PASS_ENCRYPTION_KEY;

  if (!keyHex || !/^[a-fA-F0-9]{64}$/.test(keyHex)) {
    throw new Error(
      "PASS_ENCRYPTION_KEY must be a 64-character hex string"
    );
  }

  return Buffer.from(keyHex, "hex");
};

const encryptPassToken = (token) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
};

const decryptPassToken = (encryptedToken) => {
  const key = getEncryptionKey();

  const [ivHex, tagHex, dataHex] =
    encryptedToken.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

module.exports = {
  encryptPassToken,
  decryptPassToken,
};
