const Review = require("../models/review.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Product = require("../models/product.model");

exports.createReview = asyncHandler(async (req, res) => {
  const { product, rating, comment } = req.body;

  const existingProduct = await Product.findById(product);

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  const alreadyReviewed = await Review.findOne({
    product,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    throw new ApiError(400, "You already reviewed this product");
  }

  const review = await Review.create({
    product,
    rating,
    comment,
    user: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Review created successfully", review));
});

exports.getReview = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.product) {
    filter.product = req.query.product;
  }

  const totalReviews = await Review.countDocuments(filter);

  const reviews = await Review.find(filter)
    .populate("User", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, "Reviews fetched successfully", {
      totalReviews,
      page,
      totalPages: Math.ceil(totalReviews / limit),
      reviews,
    }),
  );
});
