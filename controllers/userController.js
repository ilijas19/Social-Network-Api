const User = require("../models/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// ADMIN ONLY
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select({ password: 0 });
  res.status(StatusCodes.OK).json({ users });
};

const searchForUsers = async (req, res) => {
  const { name } = req.query;
  const queryObject = {};
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  const users = await User.find(queryObject).select({
    name: 1,
    username: 1,
    profilePicture: 1,
  });
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId }).select({
    _id: 1,
    name: 1,
    username: 1,
    posts: 1,
    numOfFollowers: 1,
    numOfFollowing: 1,
    profilePicture: 1,
    bio: 1,
  });
  if (!user) {
    throw new CustomError.NotFoundError(`No User With ID: ${userId}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select({
    password: 0,
  });
  if (!user) {
    throw new CustomError.NotFoundError("Current User Cant Be Found");
  }
  res.status(StatusCodes.OK).json({ currentUser: user });
};

const updateUser = async (req, res) => {
  const { name, bio, username } = req.body;
  const user = await User.findOne({ _id: req.user.userId });
  user.name = name || user.name;
  user.bio = bio || user.bio;
  user.username = username || user.username;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Profile Updated", user });
};
const updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new CustomError.BadRequestError("All Credientials Must Be Provided");
  }
  const user = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError("Current User Cant Be Found");
  }
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Wrong Password");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Password updated" });
};
const uploadProfilePicture = async (req, res) => {
  const fileSizeLimit = 2 * 1024 * 1024;

  const allowedMimetypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
    "image/tiff",
  ];

  if (req.files.image.size > fileSizeLimit) {
    await fs.unlink(req.files.image.tempFilePath, (err) => {
      if (err) throw err;
      console.log("Temporary file deleted");
    });
    throw new CustomError.BadRequestError("File size exceeds 2MB limit");
  }

  if (!allowedMimetypes.includes(req.files.image.mimetype)) {
    await fs.unlink(req.files.image.tempFilePath, (err) => {
      if (err) throw err;
      console.log("Temporary file deleted");
    });
    throw new CustomError.BadRequestError("File type not supported");
  }

  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "file-upload",
    }
  );
  const { secure_url } = result;

  await fs.unlink(req.files.image.tempFilePath, (err) => {
    if (err) throw err;
    console.log("Temporary file deleted");
  });

  const user = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError("Cant find current user");
  }
  user.profilePicture = secure_url;
  await user.save({ validateBeforeSave: false });
  res.status(StatusCodes.OK).json({ msg: "Profile Picture Updated" });
};

const deleteUser = async (req, res) => {
  await User.findOneAndDelete({ _id: req.user.userId });
  res.status(StatusCodes.OK).json({ msg: "User Deleted" });
};

module.exports = {
  getAllUsers,
  searchForUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  uploadProfilePicture,
  deleteUser,
};
