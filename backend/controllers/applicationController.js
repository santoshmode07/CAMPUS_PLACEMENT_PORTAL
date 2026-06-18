const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");

const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    // 1. Job Deadline Validation
    if (new Date() > new Date(job.deadline)) {
      return next(new ErrorHandler("Application deadline has passed for this job", 400));
    }

    // Fetch full student document to get branch info
    const student = await User.findById(req.user.id);
    if (!student) {
      return next(new ErrorHandler("Student profile not found", 404));
    }

    // 2. Eligible Branches Check
    if (!job.eligibleBranches.includes(student.branch)) {
      return next(
        new ErrorHandler(
          `Your branch (${student.branch}) is not eligible to apply for this job. Eligible branches: ${job.eligibleBranches.join(", ")}`,
          403
        )
      );
    }

    const existingApplication = await Application.findOne({
      student: req.user.id,
      job: jobId,
    });

    if (existingApplication) {
      return next(new ErrorHandler("Already applied for this job", 400));
    }

    const application = await Application.create({
      student: req.user.id,
      job: jobId,
    });

    res.status(201).json({
      success: true,
      message: "Applied Successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      student: req.user.id,
    }).populate("job");

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const getApplicantsForJob = async (req, res, next) => {
  try {
    // Optional check: ensure job exists before getting applicants
    const jobExists = await Job.exists({ _id: req.params.jobId });
    if (!jobExists) {
      return next(new ErrorHandler("Job not found", 404));
    }

    const applications = await Application.find({
      job: req.params.jobId,
    }).populate("student", "name email branch year cgpa resumeLink");

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(new ErrorHandler("Status field is required", 400));
    }

    const validStatuses = ["applied", "shortlisted", "selected", "rejected"];
    if (!validStatuses.includes(status)) {
      return next(
        new ErrorHandler(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        )
      );
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return next(new ErrorHandler("Application not found", 404));
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application status updated",
      application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
};
