const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name value"],
    minLength: [2, "Name must be at least 2 characters long"],
    maxLength: [20, "Name must be at most 20 characters long"],
  },
  username: {
    type: String,
    required: [true, "Please provide username"],
    maxLength: 20,
    minLength: 4,
  },
  email: {
    type: String,
    required: [true, "Please provide email address"],
    validate: {
      validator: function (email) {
        return validator.isEmail(email);
      },
      message: "Please provide valid email address",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password value"],
    minLength: [6, "Password must be at lease 6 characters long"],
    maxLength: [30, "Passsword must be at most 60 characters long"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  numOfFollowers: {
    type: Number,
    default: 0,
  },
  numOfFollowing: {
    type: Number,
    default: 0,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "No bio yet",
  },
  verificationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
});

UserSchema.pre("save", async function () {
  this.numOfFollowers = this.followers.length;
  this.numOfFollowing = this.following.length;

  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
