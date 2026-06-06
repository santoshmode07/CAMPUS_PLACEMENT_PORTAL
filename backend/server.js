const express= require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const cors = require("cors");
const cookieParser = require("cookie-parser");

const path = require("path");

connectDB();

const app=express();

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Allow cross-origin requests with credentials (cookies) for both localhost:5173 and localhost:5174
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/", (req,res)=>{
    res.json({
        success:true,
        message:"Campus Placement Portal Backend Running"
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(3000,()=>{
    console.log("server is running on port 3000");
});