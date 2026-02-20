const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
      errors: err.errors || [],
    });
  }

  if (err.isOperational) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: err.errors || [],
    });
  }

  // Unexpected error (bug)
  console.error("UNEXPECTED ERROR 💥", err);

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

module.exports = errorHandler;
