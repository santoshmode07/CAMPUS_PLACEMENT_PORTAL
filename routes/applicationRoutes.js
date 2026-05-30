const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  applyForJob,
  getMyApplications
} = require("../controllers/applicationController");

const router = express.Router();

router.post(
  "/:jobId",
  protect,
  authorize("student"),
  applyForJob
);
router.get(
   "/my-applications",
   protect,
   authorize("student"),
   getMyApplications
);

module.exports = router;