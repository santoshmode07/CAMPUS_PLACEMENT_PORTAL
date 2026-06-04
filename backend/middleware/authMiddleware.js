const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");

/**
 * Auth Protection Middleware
 * Intercepts requests to verify user session via JWT before executing route logic.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Attempt to read the token from cookies (HttpOnly cookie)
    let token = req.cookies.token;

    // 2. Fallback: Check standard Authorization Bearer header if cookie is missing
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token is resolved from cookies or headers, reject the request
    if (!token) {
      return next(new ErrorHandler("Not authorized, please log in", 401));
    }

    // Verify token validity against JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info (id, role) to the request object
    req.user = decoded;
    next();
  } catch (error) {
    // Catch token expiration or verification errors
    next(new ErrorHandler("Not authorized, invalid token", 401));
  }
};

module.exports = protect;