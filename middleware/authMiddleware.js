const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ErrorHandler("No token provided or invalid format", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = protect;