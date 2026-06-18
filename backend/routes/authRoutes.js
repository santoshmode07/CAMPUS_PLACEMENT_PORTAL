const express = require("express");
const { registerUser, loginUser, logoutUser, getProfile } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const { resumeUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", resumeUpload, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser); // Endpoint to trigger token cookie destruction
router.get("/profile", protect, getProfile);

module.exports = router;