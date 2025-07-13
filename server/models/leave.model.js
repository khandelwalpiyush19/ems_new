import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    leaveType: {
        type: String,
        required: true,
        enum: ['sick', 'annual', 'casual']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    resumptionDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },
    document: {
        type: String // Store document file path
    },
    year: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Update the updatedAt timestamp before saving
leaveSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;

