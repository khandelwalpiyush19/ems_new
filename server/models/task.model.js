import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    employee: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Employee", 
        required: true 
    },
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Project", 
        required: true 
    },
    date: { 
        type: Date, 
        required: true,
        default: Date.now
    },
    taskDescription: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'], 
        default: 'Not Started' 
    },
    comments: { 
        type: String 
    }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema, "tasks");

export default Task;