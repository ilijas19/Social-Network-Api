const sendEmail = require("./sendEmail");
const sendVerificationEmail = require("./sendVerificationEmail");
const { createJwt, verifyToken, attachCookiesToResponse } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const sendResetPasswordEmail = require("./sendResetPasswordEmail");
const createHash = require("./createHash");

module.exports = {
  sendEmail,
  sendVerificationEmail,
  createJwt,
  verifyToken,
  attachCookiesToResponse,
  createTokenUser,
  sendResetPasswordEmail,
  createHash,
};
