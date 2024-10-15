const User = require("../models/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const showMe = async (req, res) => {
  res.status(StatusCodes.OK).json({ currentUser: req.user });
};
module.exports = { showMe };
