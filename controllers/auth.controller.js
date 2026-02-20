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

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Account suspended");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      }),
    );
});

module.exports = { register, login };
