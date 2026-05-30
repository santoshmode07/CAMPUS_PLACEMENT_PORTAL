const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const { createJob } = require("../controllers/jobController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin", "company"),
  createJob
);

module.exports = router;