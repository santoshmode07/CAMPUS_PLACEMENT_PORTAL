const Job = require("../models/Job");
const ErrorHandler = require("../utils/errorHandler");

const createJob = async (req, res, next) => {
  try {
    const { title, company, description, ctc, location, deadline } = req.body;

    if (!title || !company || !description || !ctc || !location || !deadline) {
      return next(new ErrorHandler("Please fill in all required fields", 400));
    }

    const job = await Job.create({
      title,
      company,
      description,
      ctc,
      location,
      deadline,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Job Created Successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email role");

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Job Updated Successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Job Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};