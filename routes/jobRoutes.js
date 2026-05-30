const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const { createJob,getAllJobs,getJobById } = require("../controllers/jobController");

const router = express.Router();


router.get(
  "/",
  protect,
  getAllJobs
);

router.get(
  "/:id",
  protect,
  getJobById
);

router.post(
  "/",
  protect,
  authorize("admin", "company"),
  createJob
);

module.exports = router;