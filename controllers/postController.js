const Post = require("../models/Post");
const User = require("../models/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const uploadPost = async (req, res) => {
  const image = req.files.image;

  //UPLOADING IMAGE TO CLOUD
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

  const result = await cloudinary.uploader.upload(image.tempFilePath, {
    use_filename: true,
    folder: "file-upload",
  });
  if (!result) {
    throw new CustomError.BadRequestError("Failed Uploading Picture To Cloud");
  }
  await fs.unlink(image.tempFilePath, () => {
    console.log("");
  });
  //creating post
  const { secure_url } = result;
  const caption = req.body.caption;
  const currentUserId = req.user.userId;

  const post = await Post.create({
    image: secure_url,
    user: currentUserId,
    caption,
  });
  if (!post) {
    throw new CustomError.BadRequestError("Error While Creating Post");
  }
  //adding post to current user post array
  const currentUser = await User.findOne({ _id: req.user.userId });
  currentUser.posts.push(post._id);
  await currentUser.save({ validateModifiedOnly: true });

  res.status(StatusCodes.CREATED).json({ msg: "Post Uploaded" });
};
const getAllPosts = async (req, res) => {
  const queryObject = {
    user: req.user.userId,
  };
  const posts = await Post.find(queryObject);
  res.status(StatusCodes.OK).json({ nbHits: posts.length, posts });
};
const getSinglePost = async (req, res) => {
  const { id: postId } = req.params;
  const post = await Post.findOne({ _id: postId })
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username",
      },
    })
    .populate({
      path: "likes",
      select: "username",
    });
  if (!post) {
    throw new CustomError.NotFoundError(`There is no post with id:${postId} i`);
  }
  res.status(StatusCodes.OK).json({ post });
};
const updatePost = async (req, res) => {
  const { caption, id: postId } = req.body;
  const post = await Post.findOneAndUpdate(
    { _id: postId, user: req.user.userId },
    { caption },
    { new: true, runValidators: true }
  );
  if (!post) {
    throw new CustomError.NotFoundError(
      `No post with id:${postId} in your posts`
    );
  }
  res.status(StatusCodes.OK).json({ post });
};
const deletePost = async (req, res) => {
  const { id: postId } = req.params;
  const post = await Post.findOneAndDelete({
    _id: postId,
    user: req.user.userId,
  });
  if (!post) {
    throw new CustomError.NotFoundError(
      `No post with id:${postId} in your posts`
    );
  }
  res.status(StatusCodes.OK).json({ msg: "Post Deleted" });
};
const savePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be specified");
  }
  const postToBeSaved = await Post.findOne({ _id: postId });
  if (!postToBeSaved) {
    throw new CustomError.NotFoundError(`No post with id:${postId} was found`);
  }
  const currentUser = await User.findOne({ _id: req.user.userId });
  if (currentUser.savedPosts.includes(postId)) {
    throw new CustomError.BadRequestError("You already saved this post");
  }
  currentUser.savedPosts.push(postId);
  await currentUser.save({ validateModifiedOnly: true });
  res.status(StatusCodes.OK).json({ msg: "Post Saved" });
};
const unsavePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be specified");
  }
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`No post with id:${postId} was found`);
  }
  const currentUser = await User.findOne({ _id: req.user.userId });
  currentUser.savedPosts = currentUser.savedPosts.filter(
    (post) => post.toString() !== postId.toString()
  );
  await currentUser.save({ validateModifiedOnly: true });
  res.status(StatusCodes.OK).json({ msg: "Post removed from saved posts" });
};
const getSavedPosts = async (req, res) => {
  const currentUser = await User.findOne({ _id: req.user.userId }).populate({
    path: "savedPosts",
    select: "user",
  });
  res.status(StatusCodes.OK).json({ savedPosts: currentUser.savedPosts });
};
const likePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be specifieed");
  }
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`No post with id:${postId} was found`);
  }
  if (post.likes.includes(req.user.userId)) {
    throw new CustomError.BadRequestError("Cant like twice");
  }
  post.likes.push(req.user.userId);
  await post.save();
  res.status(StatusCodes.OK).json({ msg: "Post liked" });
};
const unlikePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be specified");
  }
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`No post with id:${postId} was found`);
  }
  post.likes = post.likes.filter(
    (like) => like.toString() !== req.user.userId.toString()
  );
  await post.save();
  res.status(StatusCodes.OK).json({ msg: "Like Removed", post });
};
const getPostLikes = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError(`Post id needs to be specified`);
  }
  const post = await Post.findOne({ _id: postId })
    .select({ likes: 1, numOfLikes: 1 })
    .populate({
      path: "likes",
      select: "username",
    });
  if (!post) {
    throw new CustomError.BadRequestError(`No post with id:${postId}`);
  }
  res.status(StatusCodes.OK).json({ post });
};

module.exports = {
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
};
