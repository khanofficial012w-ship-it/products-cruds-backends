const Review = require("../models/review.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

exports.createReview = asyncHandler(async (req, res) => {
  const product = await Review.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Review created successfully", product));
});
