const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  user: {
    required: [true, "Must provide user"],
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  post: {
    required: [true, "Must provide post"],
    type: mongoose.Types.ObjectId,
    ref: "Post",
  },
  text: {
    requird: [true, "Cant leave empty comment"],
    type: String,
    maxLength: 50,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
