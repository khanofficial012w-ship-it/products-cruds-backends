const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

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

  return res.status(201).json(
    new ApiResponse(201, "User created successfully", {
      id: user._id,
      username: user.username,
      email: user.email,
    }),
  );
});

module.exports = { register };
