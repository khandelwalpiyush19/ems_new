import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    projectLeader: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Employee", 
        required: true 
    },
    projectMembers: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    }],
    status: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema, "projects");

export default Project;