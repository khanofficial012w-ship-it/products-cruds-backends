const Category = require("../models/category.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    ...req.body,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Category created successfully", category));
});

exports.getProducts = asyncHandler(async (req, res) => {
  const category = await Category.find();

  res
    .status(201)
    .json(new ApiResponse(201, "Category get successfully", product));
});

exports.getSingleProduct = asyncHandler(async (req, res) => {});

exports.updateProduct = asyncHandler(async (req, res) => {});

exports.deleteProduct = asyncHandler(async (req, res) => {});
