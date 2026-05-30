const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");

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

const registerUser = async (req, res, next) => {
  try {
    const { name, email, student_id, password, role, branch, year } = req.body;

    if (!name || !email || !student_id || !password || !branch || !year) {
      return next(new ErrorHandler("Please fill in all required fields", 400));
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
      role,
      branch,
      year,
    });

    const token = await tokenGenerator(user);

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        student_id: user.student_id,
        role: user.role,
        branch: user.branch,
        year: user.year,
      },
      token,
    });
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

    const token = await tokenGenerator(user);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
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
  getProfile,
};