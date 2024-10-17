const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

const {
  followUser,
  unfollowUser,
  getFollowersList,
  getFollowingList,
} = require("../controllers/followerController");

router.get("/getFollowers", authenticateUser, getFollowersList);
router.get("/getFollowing", authenticateUser, getFollowingList);

router.get("/follow/:id", authenticateUser, followUser);
router.get("/unfollow/:id", authenticateUser, unfollowUser);

module.exports = router;
