const Application = require("../models/Application");
const Job = require("../models/Job");

const applyForJob = async (req, res) => {
  try {

    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const existingApplication =
      await Application.findOne({
        student: req.user.id,
        job:jobId
      });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "Already applied for this job"
      });
    }

    const application =
      await Application.create({
        student: req.user.id,
        job:jobId
      });

    res.status(201).json({
      success: true,
      message: "Applied Successfully",
      application
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
const getMyApplications = async (req, res) => {
  try {

    const applications =
      await Application.find({
        student: req.user.id
      }).populate("job");

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  applyForJob,
  getMyApplications
};
