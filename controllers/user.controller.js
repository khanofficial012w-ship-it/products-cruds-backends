const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const AuditLog = require("../models/audit.model");

const register = asyncHandler(async (req, res, next) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    throw new ApiError(400, "All field are required");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(400, "User already exist ");
  }

  const user = await User.create({
    username,
    password,
    email,
  });

  await AuditLog.create({
    user: user._id,
    action: "USER_REGISTER",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    metadata: {
      email: user.email,
    },
  });

  return res.status(201).json(
    new ApiResponse(201, "User created successfully", {
      id: user._id,
      username: user.username,
      email: user.email,
    }),
  );
});

const getSingleUser = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "User get successfully", {
      id: req.user._id,
      username: req.username,
      email: req.email,
    }),
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const allowedFields = ["username", "email", "password"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // If updating password → need password selected
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const oldUser = user.toObject();

  // If email or username changed → check duplicates
  if (updates.email || updates.username) {
    const existingUser = await User.findOne({
      $or: [
        updates.email ? { email: updates.email } : null,
        updates.username ? { username: updates.username } : null,
      ].filter(Boolean),
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ApiError(400, "Email or username already in use");
    }
  }

  Object.assign(user, updates);
  await user.save(); // password auto-hash if changed

  const newUser = user.toObject();

  // Detect changes (exclude password from audit)
  const changedFields = {};

  Object.keys(updates).forEach((key) => {
    if (key === "password") return;

    if (oldUser[key] !== newUser[key]) {
      changedFields[key] = {
        oldValue: oldUser[key],
        newValue: newUser[key],
      };
    }
  });

  if (updates.password) {
    changedFields.password = "UPDATED";
  }

  if (Object.keys(changedFields).length > 0) {
    await AuditLog.create({
      user: user._id,
      action: "USER_PROFILE_UPDATED",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      metadata: {
        changes: changedFields,
      },
    });
  }

  return res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", {
      id: user._id,
      username: user.username,
      email: user.email,
    }),
  );
});

module.exports = { register, updateProfile, getSingleUser };
