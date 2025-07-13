import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    // Registration required fields
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    manager: { type: String, required: true },
    salary: { type: Number, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },

    // Enums (required for registration)
    jobCategory: {
        type: String,
        required: true,
        enum: [
            "Information Technology", "Human Resources", "Finance", "Marketing", "Sales", "Operations",
            "Customer Service", "Research and Development", "Engineering", "Legal", "Administration",
            "Management", "Design", "Product Management"
        ]
    },

    jobTitle: {
        type: String,
        required: true,
        enum: [
            "Software Engineer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "HR Manager",
            "Financial Analyst", "Marketing Executive", "Sales Representative", "Product Manager",
            "QA Tester", "Customer Support Specialist", "UX/UI Designer", "Project Manager",
            "Legal Advisor", "Operations Coordinator", "Full Stack Developer"
        ]
    },

    position: {
        type: String,
        required: true,
        enum: [
            "Intern", "Junior", "Mid-Level", "Senior", "Lead", "Supervisor", "Manager",
            "Director", "VP", "CTO", "CFO", "CEO", "Developer"
        ]
    },

    department: {
        type: String,
        required: true,
        enum: [
            "Engineering", "HR", "Finance", "Sales", "Marketing", "IT Support", "Operations",
            "Customer Support", "Legal", "Product", "Research & Development", "Design", "Administration"
        ]
    },

    // Optional fields (can be added later)
    phone1: { type: String },
    phone2: { type: String },
    city: { type: String },
    address: { type: String },
    personalEmail: { type: String, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] },

    // Optional nested objects (remove required)
    nextOfKins: [{
        name: { type: String },
        occupation: { type: String },
        phone: { type: String },
        relationship: { type: String },
        address: { type: String },
        addedAt: { type: Date, default: Date.now } // Optional: Track when added
    }],

    guarantors: [{
        name: { type: String },
        occupation: { type: String },
        phone: { type: String },
        relationship: { type: String },
        address: { type: String },
        addedAt: { type: Date, default: Date.now } // Optional: Track when added
    }],

    // Optional arrays (remove required from nested fields)
    academicRecords: [
        {
            institution: { type: String },
            details: { type: String }
        }
    ],

    professionalQualifications: [
        {
            title: { type: String },
            organization: { type: String },
            duration: { type: String },
            description: { type: String }
        }
    ],

    familyDetails: [
        {
            fullName: { type: String },
            relationship: { type: String },
            phoneNo: { type: String },
            address: { type: String },
            occupation: { type: String }
        }
    ],

    documents: [
        {
            documentType: { type: String },
            filePath: { type: String },
            fileName: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }
    ],

    financialDetails: {
        bankName: { type: String },
        ifsc: { type: String },
        accountNo: { type: String },
        accountName: { type: String }
    }, mustResetPassword: {
        type: Boolean,
        default: true
    }
    ,
resetPasswordToken: String,
  resetPasswordExpire: Date,
  mustResetPassword: Boolean
    ,active: { type: Boolean, default: true }
}, { timestamps: true });

const Employee = mongoose.model("Employee", employeeSchema, "employees");

export default Employee;