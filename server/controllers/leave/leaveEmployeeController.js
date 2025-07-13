import Employee from "../../models/employee.model.js"
import Leave from "../../models/leave.model.js"


// Create a leave request
export const createLeave = async (req, res) => {
    console.log("Authenticated Employee:", req.employee);

    try {
        const { startDate, endDate, leaveType, reason } = req.body;
        const employeeId = req.employee?._id;

        // ✅ Ensure authentication was successful
        if (!employeeId) {
            return res.status(401).json({ message: "Unauthorized: Employee data missing" });
        }

        // ✅ Validate required fields
        if (!startDate || !endDate || isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
            return res.status(400).json({ message: "Invalid start or end date format" });
        }

        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: "End date cannot be before start date" });
        }

        const employee = await Employee.findById(employeeId);
        console.log("Employee found:", employee); // Debug log

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const duration = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1);

        const leave = new Leave({
            employee: employeeId,
            employeeName: `${employee.name} ${employee.lastName}`,
            startDate,
            endDate,
            leaveType,
            reason,
            duration,
            resumptionDate: new Date(endDate),
            year: new Date(startDate).getFullYear(),
            status: "pending"
        });

        await leave.save();
        res.status(201).json({ message: "Leave application submitted successfully", leave });

    } catch (error) {
        console.error("Create Leave Error:", error);
        res.status(500).json({
            message: "Error submitting leave application",
            error: error.message,
            suggestion: "Ensure you are logged in and your session hasn't expired."
        });
    }
};
// Get current user's leaves
export const getMyLeaves = async (req, res) => {
    try {
        const employeeId = req.employee._id;
        const year = new Date().getFullYear();

        const leaves = await Leave.find({ employee: employeeId }).sort({ createdAt: -1 });

        const currentYearLeaves = leaves.filter(leave =>
            new Date(leave.startDate).getFullYear() === year &&
            leave.status === 'approved'
        );

        const statistics = {
            totalLeaves: 36,
            leavesTaken: currentYearLeaves.reduce((acc, leave) => acc + leave.duration, 0),
            leavesByType: {
                sick: currentYearLeaves.filter(l => l.leaveType === 'sick').reduce((acc, l) => acc + l.duration, 0),
                annual: currentYearLeaves.filter(l => l.leaveType === 'annual').reduce((acc, l) => acc + l.duration, 0),
                casual: currentYearLeaves.filter(l => l.leaveType === 'casual').reduce((acc, l) => acc + l.duration, 0)
            }
        };

        statistics.remainingLeaves = statistics.totalLeaves - statistics.leavesTaken;

        res.json({ leaves, statistics });
    } catch (error) {
        console.error('Get My Leaves Error:', error);
        res.status(500).json({ message: 'Error fetching your leaves', error: error.message });
    }
};

