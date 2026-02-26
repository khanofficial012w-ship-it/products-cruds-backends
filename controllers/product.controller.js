const Product = require("../models/product.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", product));
});

exports.getProducts = asyncHandler(async (req, res) => {
  const product = await Product.find({ isActive: true });

  res
    .status(201)
    .json(new ApiResponse(201, "Product get successfully", product));
});

exports.getSingleProduct = asyncHandler(async (req, res) => {
  const slug = req.params.slug;

  const product = await Product.find({ slug: slug, isActive: true })
    .populate("category", "name")
    .populate("createdBy", "username");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Product found successfully", product));
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  Object.assign(product, req.body);
  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Product update successfully", product));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  product.isActive = false;
  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Product deactivated successfully", product));
});
