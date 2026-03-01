const Product = require("../models/product.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const AuditLog = require("../models/audit.model");
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    createdBy: req.user.id,
  });
  await AuditLog.create({
    user: req.user.id,
    action: "CREATE_PRODUCT", // make sure this exists in enum
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    metadata: {
      productId: product._id,
      productName: product.name,
      price: product.price,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", product));
});

exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    keyword,
    category,
    minPrice,
    maxPrice,
    rating,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;
  const filter = { isActive: true };

  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }
  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (rating) {
    filter.averageRating = { $gte: Number(rating) };
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const totalProducts = await Product.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, "Products fetched successfully", {
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      products,
    }),
  );
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

  const oldValues = product.toObject();

  Object.assign(product, req.body);
  await product.save();

  const newValues = product.toObject();

  const changeFields = {};

  Object.keys(req.body).forEach(() => {
    if (oldValues[key] !== newValues[key]) {
      changeFields[key] = {
        oldValue: oldValues[key],
        newValue: newValues[key],
      };
    }
  });

  if (Object.keys(changeFields).length > 0) {
    await AuditLog.create({
      user: req.user.id,
      action: "UPDATE_PRODUCT", // make sure this exists in enum
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      metadata: {
        productId: product._id,
        changes: changeFields,
      },
    });
  }

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

  await AuditLog.create({
    user: req.user.id,
    action: "DELETE_PRODUCT", // make sure this exists in enum
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    metadata: {
      productId: product._id,
      productName: product.name,
      price: product.price,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Product deactivated successfully", product));
});
