const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  applyForJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus
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
router.get(
   "/job/:jobId",
   protect,
   authorize("company","admin"),
   getApplicantsForJob
);

router.patch(
   "/:applicationId",
   protect,
   authorize("company","admin"),
   updateApplicationStatus
);

module.exports = router;