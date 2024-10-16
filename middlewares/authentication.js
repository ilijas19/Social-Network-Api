const Token = require("../models/Token");
const CustomError = require("../errors");
const { verifyToken } = require("../utils");
const { attachCookiesToResponse } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;
  try {
    //if accessToken
    if (accessToken) {
      const decodedAccessToken = verifyToken(accessToken);
      req.user = decodedAccessToken;
      return next();
    }

    //if refresh token
    const decodedRefreshToken = verifyToken(refreshToken);
    const existingToken = await Token.findOne({
      user: decodedRefreshToken.user.userId,
      refreshToken: decodedRefreshToken.refreshToken,
    });
    if (!existingToken && !existingToken.isValid) {
      throw new CustomError.UnauthenticatedError("Authentication Failed");
    }
    attachCookiesToResponse(res, decodedRefreshToken.user, refreshToken);
    req.user = decodedRefreshToken.user;

    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermission = (role) => {
  return async (req, res, next) => {
    if (req.user.role === "admin") return next();
    if (req.user.role === role) return next();
    throw new CustomError.UnauthorizedError("Not Authorized to use this path");
  };
};

module.exports = { authenticateUser, authorizePermission };
