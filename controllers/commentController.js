const Comment = require("../models/Comment");
const Post = require("../models/Post");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const createComment = async (req, res) => {
  const { id: postId } = req.params;
  const { commentText } = req.body;

  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`Cant find post with ID:${postId}`);
  }
  const comment = await Comment.create({
    user: req.user.userId,
    post: postId,
    text: commentText,
  });

  res.status(StatusCodes.OK).json({ comment });
};

const getPostComments = async (req, res) => {
  const { id: postId } = req.params;
  const post = await Post.findOne({ _id: postId })
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username",
      },
    })
    .select("comments");
  res.status(StatusCodes.OK).json({ post });
};

const updateComment = async (req, res) => {
  const { id: commentId } = req.params;
  const { text } = req.body;
  if (!text || !commentId) {
    throw new CustomError.BadRequestError(
      "Comment id and text must be provided"
    );
  }
  const comment = await Comment.findOneAndUpdate(
    {
      user: req.user.userId,
      _id: commentId,
    },
    { text },
    { new: true, runValidators: true }
  );
  if (!comment) {
    throw new CustomError.NotFoundError(
      `Comment with id: ${commentId} was not found in your comments`
    );
  }
  res.json(comment);
};
const deleteComment = async (req, res) => {
  const { id: commentId } = req.params;
  if (!commentId) {
    throw new CustomError.BadRequestError("Comment id needs to be specified");
  }
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    user: req.user.userId,
  });
  if (!comment) {
    throw new CustomError.NotFoundError(
      `Comment with id: ${commentId} was not found in your comments`
    );
  }
  res.status(StatusCodes.OK).json({ msg: "Comment deleted" });
};
const deleteCommentFromPost = async (req, res) => {
  const { postId, commentId } = req.body;
  if (!postId || !commentId) {
    throw new CustomError.BadRequestError(
      "Both credientials needs to be specified"
    );
  }
  const post = await Post.findOne({ _id: postId, user: req.user.userId });
  if (!post) {
    throw new CustomError.NotFoundError(
      `No post with id: ${postId} was found in your posts`
    );
  }
  const comment = await Comment.findOneAndDelete({
    post: post._id,
    _id: commentId,
  });

  if (!comment) {
    throw new CustomError.NotFoundError(
      `No comment with id: ${commentId} was found on your post`
    );
  }
  res.status(StatusCodes.OK).json({ msg: "Comment deleted from your post" });
};

module.exports = {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  deleteCommentFromPost,
};
