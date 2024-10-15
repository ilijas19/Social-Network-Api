const crypto = require("crypto");

const createHash = (string) => {
  const hashedString = crypto.createHash("sha256").update(string).digest("hex");

  return hashedString;
};

module.exports = createHash;
