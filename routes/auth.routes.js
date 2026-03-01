const express = require("express");
const router = express.Router();

const {
  login,
  refreshToken,
  logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

// AUTH Routes
router.post("/login", login);
router.post("/refreshtoken", protect, refreshToken);
router.post("/logout", protect, logout);

module.exports = router;
