require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
//packages
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//db
const connectDb = require("./db/connectDb");
//middlewares
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
//routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const followerRouter = require("./routes/followerRoutes");
const postRouter = require("./routes/postRoutes");
//app
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload({ useTempFiles: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/followers", followerRouter);
app.use("/api/v1/posts", postRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`app is listening on port ${port}`);
    });
  } catch (error) {}
};

start();
