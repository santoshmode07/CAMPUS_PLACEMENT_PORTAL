const mongoose=require("mongoose");

const jobSchema= new mongoose.Schema({

    title: {
        type:String,
        required:true
    },
    company:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    ctc:{
        type:Number,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    deadline:{
        type:Date,
        required:true
    },
    eligibleBranches: {
        type: [String],
        required: true,
        enum: ["CSE", "ECE", "EEE", "Mech", "CIVIL"]
    },
    bannerImage: {
        type: String,
        default: ""
    },
    galleryImages: {
        type: [String],
        default: []
    },
    jdLink: {
        type: String,
        default: ""
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
});

const Job=mongoose.model("Job",jobSchema)

module.exports=Job;