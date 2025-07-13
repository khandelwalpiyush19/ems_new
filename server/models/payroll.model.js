import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    earnings: {
        basicWage: Number,
        houseRentAllowance: Number,
        overtime: Number,
        gratuity: Number,
        specialAllowance: Number,
        pfEmployer: Number,
        esiEmployer: Number,
        totalEarnings: Number // This should sum all of the above
    },
    deductions: {
        pfEmployee: Number,
        esiEmployee: Number,
        tax: Number,
        otherDeductions: Number,
        total: Number // This should sum all deductions
    },
    ctc: {
        type: Number // Grand Total CTC = basic + allowances + employer contributions
    },
    inHandSalary: {
        type: Number // = totalEarnings - deductions.total
    },
    leaves: [{
        type: {
            type: String,
            enum: ['Sick', 'Casual', 'Vacation', 'Other'],
            required: true
        },
        reason: String,
        days: Number
    }],
    status: {
        type: String,
        enum: ['Pending', 'Processed', 'Paid'],
        default: 'Pending'
    },
    processedDate: Date,
    paidDate: Date
}, {
    timestamps: true
});

const Payroll = mongoose.model("Payroll", payrollSchema, "payrolls");
export default Payroll;
