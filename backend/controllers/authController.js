const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");

// Helper function to generate jwt payload token
const tokenGenerator = async (user) => {
  return await jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
};

// Helper function to attach cookie and send user response
const sendTokenResponse = async (user, statusCode, res, message) => {
  const token = await tokenGenerator(user);

  // Cookie security options
  const cookieOptions = {
    httpOnly: true, // Crucial: Prevents JavaScript from reading the cookie (protects against XSS)
    secure: process.env.NODE_ENV === "production", // Enforces HTTPS protocol in production environment
    sameSite: "lax", // Protects against CSRF attacks in cross-site requests
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days expiration (matches JWT expiration duration)
  };

  res.status(statusCode)
    .cookie("token", token, cookieOptions) // Attaches cookie named "token"
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        student_id: user.student_id,
        role: user.role,
        branch: user.branch,
        year: user.year,
        cgpa: user.cgpa,
        skills: user.skills,
        resumeLink: user.resumeLink,
      },
    });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, student_id, password, role, branch, year, cgpa, skills } = req.body;

    const userRole = role || "student";

    if (!name || !email || !student_id || !password || !branch || !year) {
      return next(new ErrorHandler("Please fill in all required fields", 400));
    }

    let parsedSkills = [];
    let cgpaNum;
    let yearNum = Number(year);
    let resolvedResumeLink;

    if (userRole === "student") {
      cgpaNum = cgpa !== undefined ? Number(cgpa) : undefined;
      
      // Parse skills: handle array, JSON string, or comma-separated string formats
      if (skills) {
        if (typeof skills === "string") {
          try {
            parsedSkills = JSON.parse(skills);
          } catch (e) {
            parsedSkills = skills.split(",").map(s => s.trim()).filter(Boolean);
          }
        } else if (Array.isArray(skills)) {
          parsedSkills = skills;
        }
      }

      // Extract uploaded resume PDF file
      if (!req.file) {
        return next(new ErrorHandler("Please upload your resume in PDF format", 400));
      }

      if (req.file.path && req.file.path.startsWith("http")) {
        resolvedResumeLink = req.file.path; // Cloudinary secure raw URL
      } else {
        resolvedResumeLink = `${req.protocol}://${req.get("host")}/uploads/resumes/${req.file.filename}`;
      }

      // Validations
      if (cgpaNum === undefined || parsedSkills.length === 0 || !resolvedResumeLink) {
        return next(new ErrorHandler("Students must provide CGPA, skills, and a PDF resume upload", 400));
      }
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        return next(new ErrorHandler("CGPA must be a number between 0 and 10", 400));
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("User already exists with this email", 400));
    }

    const existingStudentId = await User.findOne({ student_id });
    if (existingStudentId) {
      return next(new ErrorHandler("User already exists with this Student ID", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      student_id,
      password: hashedPassword,
      role: userRole,
      branch,
      year: yearNum,
      cgpa: userRole === "student" ? cgpaNum : undefined,
      skills: userRole === "student" ? parsedSkills : undefined,
      resumeLink: userRole === "student" ? resolvedResumeLink : undefined,
    });

    await sendTokenResponse(user, 201, res, "User Registered Successfully");
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    await sendTokenResponse(user, 200, res, "Login Successful");
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    // Clear cookie by overwriting it with a past expiration date
    res.cookie("token", null, {
      httpOnly: true,
      expires: new Date(0), // Sets expiration date to past, forcing deletion
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
};