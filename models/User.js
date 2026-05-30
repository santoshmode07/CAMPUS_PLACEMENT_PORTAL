const mongoose =require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
        },
    email:{
        type:String,
        required:true,
        unique:true
    },
    student_id:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["student","company","admin"],
        default:"student"
    },
    branch:{
        type:String,
        required:true,
        enum:["CSE","ECE","EEE","Mech","CIVIL"]
    },
    year:{
        type:Number,
        required:true,
        enum:[1,2,3,4]
    }


});

const User = mongoose.model("User", userSchema);

module.exports = User;