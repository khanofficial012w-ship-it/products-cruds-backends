const express = require("express");
const {
  createCategory,
  getCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { protect } = require("../middlewares/auth.middleware");
const router = express.Router();

router.route().get(getCategory).post(protect, createCategory);
router
  .route("/:slug")
  .get(getSingleCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;
