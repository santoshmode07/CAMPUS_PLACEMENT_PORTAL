const express = require("express");
const { registerUser, loginUser, logoutUser, getProfile } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser); // Endpoint to trigger token cookie destruction
router.get("/profile", protect, getProfile);

module.exports = router;