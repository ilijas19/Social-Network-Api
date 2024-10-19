const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

const {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  deleteCommentFromPost,
} = require("../controllers/commentController");

router.delete("/deleteComment", authenticateUser, deleteCommentFromPost);

router
  .route("/:id")
  .post(authenticateUser, createComment)
  .get(getPostComments)
  .patch(authenticateUser, updateComment)
  .delete(authenticateUser, deleteComment);

module.exports = router;
