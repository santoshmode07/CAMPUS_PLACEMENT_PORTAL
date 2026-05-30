const Job = require("../models/Job");

const createJob = async (req, res) => {
  try {

    const {
      title,
      company,
      description,
      ctc,
      location,
      deadline
    } = req.body;

    const job = await Job.create({
      title,
      company,
      description,
      ctc,
      location,
      deadline,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Job Created Successfully",
      job
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


const getAllJobs = async (req, res) => {
  try {

    const jobs = await Job.find().populate("createdBy","name email role");

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getJobById = async (req, res) => {
  try {

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    res.status(200).json({
      success: true,
      job
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const updateJob = async (req, res) => {
  try {

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Job Updated Successfully",
      job
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const deleteJob = async (req, res) => {
  try {

    const job = await Job.findByIdAndDelete(
      req.params.id
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Job Deleted Successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob
};