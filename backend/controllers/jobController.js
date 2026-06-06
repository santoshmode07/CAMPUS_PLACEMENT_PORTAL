const Job = require("../models/Job");
const ErrorHandler = require("../utils/errorHandler");

const createJob = async (req, res, next) => {
  try {
    const { 
      title, 
      company, 
      description, 
      ctc, 
      location, 
      deadline, 
      eligibleBranches,
      bannerImage,
      galleryImages 
    } = req.body;

    if (!title || !company || !description || !ctc || !location || !deadline || !eligibleBranches) {
      return next(new ErrorHandler("Please fill in all required fields including eligible branches", 400));
    }

    // Safely parse eligibleBranches if sent as stringified JSON or comma-separated string
    let branches = eligibleBranches;
    if (typeof eligibleBranches === "string") {
      try {
        branches = JSON.parse(eligibleBranches);
      } catch (e) {
        branches = eligibleBranches.split(",").map(b => b.trim());
      }
    }

    if (!Array.isArray(branches) || branches.length === 0) {
      return next(new ErrorHandler("Eligible branches must be a non-empty array", 400));
    }

    // Resolve image paths: prioritize files uploaded through req.files, fall back to text inputs
    let bannerImageUrl = bannerImage || "";
    let galleryImageUrls = [];
    if (typeof galleryImages === "string") {
      galleryImageUrls = [galleryImages];
    } else if (Array.isArray(galleryImages)) {
      galleryImageUrls = galleryImages;
    }

    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage[0]) {
        const file = req.files.bannerImage[0];
        bannerImageUrl = file.path && file.path.startsWith("http")
          ? file.path
          : `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      }
      if (req.files.galleryImages) {
        const uploadedGallery = req.files.galleryImages.map((file) =>
          file.path && file.path.startsWith("http")
            ? file.path
            : `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
        );
        galleryImageUrls = [...galleryImageUrls, ...uploadedGallery];
      }
    }

    const job = await Job.create({
      title,
      company,
      description,
      ctc,
      location,
      deadline,
      eligibleBranches: branches,
      bannerImage: bannerImageUrl,
      galleryImages: galleryImageUrls,
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