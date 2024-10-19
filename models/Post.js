const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Image Path Must Be Specified"],
    },
    caption: {
      type: String,
      maxLength: [50, "Caption must be at most 50 characters long"],
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    numOfLikes: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { toJSON: { virtuals: true } }
);

PostSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
  justOne: false,
});

PostSchema.pre("save", function () {
  this.numOfLikes = this.likes.length;
});

module.exports = mongoose.model("Post", PostSchema);
