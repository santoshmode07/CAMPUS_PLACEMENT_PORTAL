const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const checkJobOwner = require("../middleware/jobOwnerMiddleware");


const { createJob,getAllJobs,getJobById,updateJob,deleteJob} = require("../controllers/jobController");

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
router.put(
   "/:id",
   protect,
   authorize("admin","company"),
   checkJobOwner,
   updateJob
);
router.delete(
   "/:id",
   protect,
   authorize("admin","company"),
   checkJobOwner,
   deleteJob
);
router.post(
  "/",
  protect,
  authorize("admin", "company"),
  createJob
);

module.exports = router;