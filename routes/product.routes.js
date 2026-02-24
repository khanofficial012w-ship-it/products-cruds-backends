const express = require("express");
const {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { protect } = require("../middlewares/auth.middleware");
const router = express.Router();

router.route("/").get(getProducts).post(protect, createProduct);

router
  .route("/:slug")
  .get(getSingleProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
