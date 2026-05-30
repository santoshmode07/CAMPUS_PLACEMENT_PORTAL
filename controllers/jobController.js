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

module.exports = {
  createJob
};