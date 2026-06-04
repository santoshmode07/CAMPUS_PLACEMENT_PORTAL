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
    },
    cgpa: {
        type: Number,
        min: [0, "CGPA cannot be negative"],
        max: [10, "CGPA cannot exceed 10"]
    },
    skills: {
        type: [String],
        default: []
    },
    resumeLink: {
        type: String,
        validate: {
            validator: function(v) {
                if (this.role !== "student") return true;
                if (!v) return false; // Students must have a resumeLink
                return v.includes("drive.google.com");
            },
            message: props => `${props.value} is not a valid Google Drive link! Resume must be a Google Drive link.`
        }
    }


});

const User = mongoose.model("User", userSchema);

module.exports = User;