import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    clockIn: {
        type: Date,
        required: true,
    },
    clockOut: {
        type: Date,
    },
    breaks: [{
        breakIn: Date,
        breakOut: Date
    }],
    effectiveHours: {
        type: Number,
        default: 0,
    },
    grossHours: {
        type: Number,
        default: 0,
    },
    overtimeHours: {
        type: Number,
        default: 0,
    },
    isOnTime: {
        type: Boolean,
        default: true,
    },
    isLateArrival: {
        type: Boolean,
        default: false,
    },
    isEarlyDeparture: {
        type: Boolean,
        default: false,
    },
    averageWorkHours: {
        type: Number,
        default: 0,
    },
    workLocation: {
        type: String,
        enum: ["office", "work_from_home"],
        default: "office",
    },
    status: {
        type: String,
        enum: ["present", "absent", "half-day","onBreak"],
        default: "present",
    },
}, {
    timestamps: true,
});

attendanceSchema.pre("save", function (next) {
    if (this.clockIn) {
        const startOfDay = new Date(this.clockIn);
        startOfDay.setHours(0, 0, 0, 0);
        this.date = startOfDay;
    }

    if (this.clockIn && this.clockOut) {
        const durationMs = this.clockOut - this.clockIn;
        const grossHours = durationMs / (1000 * 60 * 60);
        this.grossHours = Math.round(grossHours * 100) / 100;

        // Calculate total break duration
        let totalBreakMs = 0;
        if (this.breaks && this.breaks.length > 0) {
            this.breaks.forEach(b => {
                if (b.breakIn && b.breakOut) {
                    totalBreakMs += new Date(b.breakOut) - new Date(b.breakIn);
                }
            });
        }

        const effectiveHours = (durationMs - totalBreakMs) / (1000 * 60 * 60);
        this.effectiveHours = Math.round(effectiveHours * 100) / 100;

        // Mark late if clock-in is after 9:00 AM
        const nineAM = new Date(this.clockIn);
        nineAM.setHours(9, 0, 0, 0);
        this.isLateArrival = this.clockIn > nineAM;
        this.isOnTime = !this.isLateArrival;

        // Mark early departure if clock-out is before 5:00 PM
        const fivePM = new Date(this.clockIn);
        fivePM.setHours(17, 0, 0, 0);
        const clockOutDate = new Date(this.clockOut);
        this.isEarlyDeparture = clockOutDate < fivePM;

        // Calculate overtime (anything over 8 hrs)
        this.overtimeHours = this.effectiveHours > 8
            ? Math.round((this.effectiveHours - 8) * 100) / 100
            : 0;
    }

    next();
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
