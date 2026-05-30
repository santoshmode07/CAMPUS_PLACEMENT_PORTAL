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
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

const Job=mongoose.model("Job",jobSchema)

module.exports=Job;