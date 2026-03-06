const router = require("express").Router();
const { createReview, getReview } = require("../controllers/review.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/", protect, createReview);
router.get("/", getReview);

module.exports = router;
