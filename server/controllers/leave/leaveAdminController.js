import Leave from "../../models/leave.model.js"
import mongoose from "mongoose";

export const getAllLeaves = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { status, year } = req.query;
        let query = {};

        if (status) query.status = status;
        if (year) query.year = parseInt(year);

        const leaves = await Leave.find(query)
            .populate('employee', 'name email department')
            .sort({ createdAt: -1 });

        const statistics = {
            totalLeaves: 36,
            leavesTaken: leaves.filter(l => l.status === 'approved').reduce((acc, l) => acc + l.duration, 0),
            leavesByType: {
                sick: leaves.filter(l => l.leaveType === 'sick' && l.status === 'approved').reduce((acc, l) => acc + l.duration, 0),
                annual: leaves.filter(l => l.leaveType === 'annual' && l.status === 'approved').reduce((acc, l) => acc + l.duration, 0),
                casual: leaves.filter(l => l.leaveType === 'casual' && l.status === 'approved').reduce((acc, l) => acc + l.duration, 0)
            }
        };

        statistics.remainingLeaves = statistics.totalLeaves - statistics.leavesTaken;

        res.json({ leaves, statistics });
    } catch (error) {
        console.error('Get All Leaves Error:', error);
        res.status(500).json({ message: 'Error fetching leaves', error: error.message });
    }
};



export const updateLeaveStatus = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave application not found' });
        }

        leave.status = status;
        if (status === 'rejected' && rejectionReason) {
            leave.rejectionReason = rejectionReason;
        } else {
            leave.rejectionReason = undefined; // clear if not rejected
        }

        await leave.save();
        res.json({ message: 'Leave status updated successfully', leave });
    } catch (error) {
        console.error('Update Leave Status Error:', error);
        res.status(500).json({ message: 'Error updating leave status', error: error.message });
    }
};

 
export const getLeaveStatistics = async (req, res) => {

    try {
        // Step 1: Determine employee ID
        const rawId = req.params.employeeId || req.user?._id || req.employee?._id;

        if (!rawId) {
            return res.status(400).json({ message: 'Employee ID missing' });
        }

        // Step 2: Convert to ObjectId
        let employeeObjectId;
        try {
            employeeObjectId = new mongoose.Types.ObjectId(rawId);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid employee ID format' });
        }

        // Step 3: Admin access control (only needed when accessing someone else's data)
        if (req.params.employeeId && !(req.user?.role === 'admin' || req.employee?.isAdmin)) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        // Step 4: Find all leave records for this employee
        const leaves = await Leave.find({ employee: employeeObjectId });

        // Step 5: Compute statistics
        const statistics = {
            totalLeaves: leaves.length,
            approvedLeaves: leaves.filter(l => l.status === 'approved').length,
            pendingLeaves: leaves.filter(l => l.status === 'pending').length,
            rejectedLeaves: leaves.filter(l => l.status === 'rejected').length,
            leavesByType: leaves.reduce((acc, leave) => {
                acc[leave.leaveType] = (acc[leave.leaveType] || 0) + 1;
                return acc;
            }, {})
        };

        return res.json(statistics);
    } catch (error) {
        console.error('Leave Statistics Error:', error);
        return res.status(500).json({ message: 'Error fetching leave statistics', error: error.message });
    }
};