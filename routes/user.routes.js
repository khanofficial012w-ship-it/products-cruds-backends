const express = require("express");
const router = express.Router();

const {
  register,
  updateProfile,
  getSingleUser,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");
// AUTH Routes
router.route("/").get(getSingleUser).post(register).put(protect, updateProfile);

module.exports = router;
