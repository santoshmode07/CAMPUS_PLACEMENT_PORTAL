const Job = require("../models/Job");
const ErrorHandler = require("../utils/errorHandler");

const checkJobOwner = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    if (
      job.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(new ErrorHandler("Not authorized to perform this action", 403));
    }

    req.job = job;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkJobOwner;