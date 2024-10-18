const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

const {
  uploadPost,
  updatePost,
  getAllPosts,
  getSinglePost,
  deletePost,
  savePost,
  unsavePost,
  getSavedPosts,
  likePost,
  unlikePost,
  getPostLikes,
} = require("../controllers/postController");

router
  .route("/")
  .get(authenticateUser, getAllPosts)
  .post(authenticateUser, uploadPost);

router.get("/save/:id", authenticateUser, savePost);
router.get("/unsave/:id", authenticateUser, unsavePost);
router.get("/saved", authenticateUser, getSavedPosts); //

router.get("/like/:id", authenticateUser, likePost); //
router.get("/unlike/:id", authenticateUser, unlikePost); //
router.get("/postLikes/:id", authenticateUser, getPostLikes); //

router
  .route("/:id")
  .get(authenticateUser, getSinglePost)
  .patch(authenticateUser, updatePost)
  .delete(authenticateUser, deletePost);

module.exports = router;
