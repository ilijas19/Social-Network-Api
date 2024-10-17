const User = require("../models/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const followUser = async (req, res) => {
  const { id: followUserId } = req.params;
  const currentUser = await User.findOne({ _id: req.user.userId });
  const userToBeFollowed = await User.findOne({ _id: followUserId });
  if (!userToBeFollowed) {
    throw new CustomError.NotFoundError(
      `No user to follow with id: ${followUserId}`
    );
  }
  if (userToBeFollowed.followers.includes(currentUser._id)) {
    throw new CustomError.BadRequestError(
      "You are already following this user"
    );
  }
  //ADDING CURRENT USER TO userToBeFollowed FOLLOWERS LIST []
  userToBeFollowed.followers.push(currentUser._id);
  //ADDING userToBeFollowed TO CURRENT USER FOLLOWING LIST []
  currentUser.following.push(userToBeFollowed._id);

  await currentUser.save({ validateBeforeSave: false });
  await userToBeFollowed.save({ validateBeforeSave: false });
  res.status(StatusCodes.OK).json({ userToBeFollowed, currentUser });
};

const unfollowUser = async (req, res) => {
  const { id: unfollowUserId } = req.params;
  const currentUser = await User.findOne({ _id: req.user.userId });
  const userToBeUnfollowed = await User.findOne({ _id: unfollowUserId });

  if (!userToBeUnfollowed) {
    throw new CustomError.NotFoundError(
      `No user to unfollow with id: ${unfollowUserId}`
    );
  }

  // Removing current user from userToBeUnfollowed followers list
  userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(
    (user) => user.toString() !== currentUser._id.toString()
  );

  // Removing userToBeUnfollowed from current users following list
  currentUser.following = currentUser.following.filter(
    (user) => user.toString() !== userToBeUnfollowed._id.toString()
  );

  await currentUser.save({ validateBeforeSave: false });
  await userToBeUnfollowed.save({ validateBeforeSave: false });

  res.status(StatusCodes.OK).json({ userToBeUnfollowed, currentUser });
};

const getFollowingList = async (req, res) => {
  const currentUser = await User.findOne({ _id: req.user.userId })
    .select({
      following: 1,
      numOfFollowing: 1,
    })
    .populate({ path: "following", select: "username" });

  res.status(StatusCodes.OK).json({
    following: currentUser.following,
    numOfFollowing: currentUser.numOfFollowing,
  });
};
const getFollowersList = async (req, res) => {
  const currentUser = await User.findOne({ _id: req.user.userId })
    .select({
      followers: 1,
      numOfFollowers: 1,
    })
    .populate({ path: "followers", select: "username" });

  res.status(StatusCodes.OK).json({
    followers: currentUser.followers,
    numOfFollowers: currentUser.numOfFollowers,
  });
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowersList,
  getFollowingList,
};

// const followUser = async (req, res) => {
//   const { id: followUserId } = req.params;
//   const currentUser = await User.findOne({ _id: req.user.userId });
//   const isAlreadyFollowing = await User.findOne({
//     _id: followUserId,
//     followers: currentUser._id,
//   });
//   if (isAlreadyFollowing) {
//     throw new CustomError.BadRequestError(
//       "You are already following this user"
//     );
//   }
//   //ADDING CURRENT USER TO userToBeFollowed FOLLOWERS LIST []
//   const userToBeFollowed = await User.findOneAndUpdate(
//     { _id: followUserId },
//     { $push: { followers: currentUser._id } },
//     { new: true, runValidators: true }
//   );
//   screenY;
//   if (!userToBeFollowed) {
//     throw new CustomError.NotFoundError(
//       `No user to follow with id: ${followUserId}`
//     );
//   }

//   //ADDING userToBeFollowed TO CURRENT USER FOLLOWERS LIST []
//   res.status(StatusCodes.OK).json({ userToBeFollowed });
// };
