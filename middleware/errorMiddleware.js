const ErrorHandler = require("../utils/errorHandler");

// 404 Handler for undefined routes
const notFound = (req, res, next) => {
  const error = new ErrorHandler(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || "Internal Server Error";
  error.statusCode = err.statusCode || 500;

  // Log error in development (vibrant red logging for readability)
  if (process.env.NODE_ENV !== "production") {
    console.error(`\x1b[31m[Error] Status: ${error.statusCode} | Message: ${error.message}\n${err.stack}\x1b[0m`);
  }

  // Mongoose Bad ObjectId (Cast Error)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ID format: ${err.value}`;
    error = new ErrorHandler(message, 400);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for field: ${field}. Please use another value.`;
    error = new ErrorHandler(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorHandler(message, 400);
  }

  // JWT Invalid Error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid web token. Please log in again.";
    error = new ErrorHandler(message, 401);
  }

  // JWT Expired Error
  if (err.name === "TokenExpiredError") {
    const message = "Your web token has expired. Please log in again.";
    error = new ErrorHandler(message, 401);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
