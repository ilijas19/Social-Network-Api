const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");
const {
  getAllUsers,
  searchForUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  uploadProfilePicture,
  deleteUser,
} = require("../controllers/userController");

router.get("/", authenticateUser, authorizePermission("admin"), getAllUsers);
router.get("/search", searchForUsers);
router.get("/showMe", authenticateUser, showCurrentUser);
router.patch("/updateUser", authenticateUser, updateUser);
router.patch("/updateUserPassword", authenticateUser, updateUserPassword);
router.post("/uploadProfilePicture", authenticateUser, uploadProfilePicture);
router.delete("/deleteUser", authenticateUser, deleteUser);
router.route("/:id").get(getSingleUser);
module.exports = router;
