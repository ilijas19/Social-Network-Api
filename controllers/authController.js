const User = require("../models/User");
const Token = require("../models/Token");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  attachCookiesToResponse,
  verifyToken,
  createTokenUser,
  sendResetPasswordEmail,
  createHash,
} = require("../utils");

const registerUser = async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    throw new CustomError.BadRequestError("All values must be provided");
  }
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new CustomError.BadRequestError("Email is already in use");
  }
  const verificationToken = crypto.randomBytes(40).toString("hex");
  const user = await User.create({ email, name, password, verificationToken });
  const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    token: verificationToken,
    origin,
  });
  res
    .status(StatusCodes.OK)
    .json({ msg: "Check Your Email For Verification Link" });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  if (!verificationToken || !email) {
    throw new CustomError.BadRequestError("Email and Token must be provided");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Authentication Failed");
  }
  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError("Authentication Failed");
  }
  user.isVerified = true;
  user.verificationToken = "";
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Account verified" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Email and Password must be provided"
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Wrong Email Or Password");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Wrong Email Or Password");
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please Verify Your Email");
  }
  const tokenUser = createTokenUser(user);
  let refreshToken;
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const isValid = existingToken.isValid;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Authentication failed");
    }

    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse(res, tokenUser, refreshToken);
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];
  await Token.create({ refreshToken, ip, userAgent, user: user._id });
  attachCookiesToResponse(res, tokenUser, refreshToken);
  res.status(StatusCodes.OK).json(tokenUser);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Email must be provided");
  }
  const user = await User.findOne({ email });
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("User is not verified");
  }
  if (user) {
    const passwordToken = crypto.randomBytes(40).toString("hex");
    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });
    const expirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = expirationDate;
    await user.save();
  }
  res.status(StatusCodes.OK).json({ msg: "Check Your Email" });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    throw new CustomError.BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === token &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.send("reset password");
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(StatusCodes.OK).json({ msg: "Logout" });
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
};
