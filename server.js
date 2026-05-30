const express= require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

connectDB();

const app=express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.get("/", (req,res)=>{
    res.json({
        success:true,
        message:"Campus Placement Portal Backend Running"
    });
});

app.listen(3000,()=>{
    console.log("server is running on port 3000");
});