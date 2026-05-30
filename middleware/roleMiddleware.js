const ErrorHandler = require("../utils/errorHandler");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler("You are not authorized to perform this action", 403)
      );
    }
    next();
  };
};

module.exports = authorize;