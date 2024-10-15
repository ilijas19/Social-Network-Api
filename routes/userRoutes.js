const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");
const { showMe } = require("../controllers/userController");

router.get("/showMe", authenticateUser, showMe);

module.exports = router;
