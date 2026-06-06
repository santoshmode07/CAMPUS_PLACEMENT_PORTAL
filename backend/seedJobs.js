const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Job = require("./models/Job");
const bcrypt = require("bcryptjs");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Find or create a company user to act as the creator of these jobs
    let companyUser = await User.findOne({ role: "company" });
    if (!companyUser) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      companyUser = await User.create({
        name: "Google Recruitment Team",
        email: "recruiter@google.com",
        student_id: "COMP-001", // Required by backend schema validation
        password: hashedPassword,
        role: "company",
        branch: "CSE",
        year: 4
      });
      console.log("Created mock recruiter account: recruiter@google.com");
    }

    // Clear existing jobs to ensure a clean slate
    await Job.deleteMany({});
    console.log("Cleared old jobs.");

    // Seed sample jobs
    const jobs = [
      {
        title: "Software Engineer Intern",
        company: "Google",
        description: "Join Google's core search infrastructure team. You will work on writing high-performance APIs, database optimization, and scalable backend services.",
        ctc: 24, // 24 LPA
        location: "Bangalore, India",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        eligibleBranches: ["CSE", "ECE"],
        bannerImage: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1200&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80"
        ],
        createdBy: companyUser._id
      },
      {
        title: "Systems Validation Engineer",
        company: "Intel",
        description: "Looking for students interested in hardware-level firmware programming, device drivers development, and silicon chip validation logic.",
        ctc: 18, // 18 LPA
        location: "Hyderabad, India",
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        eligibleBranches: ["ECE", "EEE"],
        bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=400&q=80"
        ],
        createdBy: companyUser._id
      },
      {
        title: "Full Stack Web Developer",
        company: "Stripe",
        description: "Build developer-facing payment dashboards. Essential skills: React, Tailwind CSS, Node.js, Express, and PostgreSQL/MongoDB databases.",
        ctc: 32, // 32 LPA
        location: "Remote, India",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        eligibleBranches: ["CSE", "ECE", "EEE", "Mech", "CIVIL"], // All branches
        bannerImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80"
        ],
        createdBy: companyUser._id
      }
    ];

    await Job.insertMany(jobs);
    console.log("Mock jobs seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
