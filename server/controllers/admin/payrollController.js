import Payroll from "../../models/payroll.model.js";
import Employee from"../../models/employee.model.js"



// Update payroll details

export const updatePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Ensure earnings and deductions are objects
        const earnings = updates.earnings || {};
        const deductions = updates.deductions || {};

        // Calculate total earnings
        earnings.totalEarnings = 
            (earnings.basicWage || 0) +
            (earnings.houseRentAllowance || 0) +
            (earnings.overtime || 0) +
            (earnings.gratuity || 0) +
            (earnings.specialAllowance || 0) +
            (earnings.pfEmployer || 0) +
            (earnings.esiEmployer || 0);

        // Calculate total deductions
        deductions.total = 
            (deductions.pfEmployee || 0) +
            (deductions.esiEmployee || 0) +
            (deductions.tax || 0) +
            (deductions.otherDeductions || 0);

        // Calculate CTC (Cost to Company)
        const ctc = earnings.totalEarnings;

        // Calculate in-hand salary
        const inHandSalary = earnings.totalEarnings - deductions.total;

        // Update final object
        updates.earnings = earnings;
        updates.deductions = deductions;
        updates.ctc = ctc;
        updates.inHandSalary = inHandSalary;

        // Perform the update
        const payroll = await Payroll.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        ).populate('employeeId', 'name designation salary');

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll not found' });
        }

        res.json(payroll);
    } catch (error) {
        console.error('Update Payroll Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get payroll details for logged-in employee
export const getEmployeePayroll = async (req, res) => {
    try {
        const employeeId = req.employee._id; // Authenticated employee's ID
        const { month, year } = req.query;

        // Fetch employee details
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Try to find payroll
        let payroll = await Payroll.findOne({
            employeeId,
            month,
            year
        }).populate('employeeId', 'name designation salary jobTitle department');

        // If not found, create a default payroll
        if (!payroll) {
            const basicSalary = employee.salary;

            // Default earnings
            const earnings = {
                basicWage: basicSalary,
                houseRentAllowance: 0,
                overtime: 0,
                gratuity: 0,
                specialAllowance: 0,
                pfEmployer: 0,
                esiEmployer: 0
            };
            earnings.totalEarnings = Object.values(earnings).reduce((sum, val) => sum + (val || 0), 0);

            // Default deductions
            const deductions = {
                pfEmployee: 0,
                esiEmployee: 0,
                tax: 0,
                otherDeductions: 0
            };
            deductions.total = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);

            // Calculate CTC and In-Hand
            const ctc = earnings.totalEarnings;
            const inHandSalary = earnings.totalEarnings - deductions.total;

            payroll = new Payroll({
                employeeId,
                month,
                year,
                basicSalary,
                earnings,
                deductions,
                ctc,
                inHandSalary,
                status: 'Pending'
            });

            await payroll.save();
        }

        res.json(payroll);
    } catch (error) {
        console.error('Payroll Error:', error);
        res.status(500).json({ message: error.message });
    }
};


// Get all payrolls for a specific month and year
export const getAllPayrolls = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        const payrolls = await Payroll.find({ month, year })
            .populate('employeeId', 'name designation salary jobTitle department');

        res.json(payrolls);
    } catch (error) {
        console.error('Get All Payrolls Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all employees' payroll data for admin
export const getAllEmployeesPayroll = async (req, res) => {
    try {
        // Get all employees with salary set
        const employees = await Employee.find({ salary: { $exists: true } })
            .select('name salary designation jobTitle department');

        // Use current month/year if not provided
        const month = req.query.month || new Date().toLocaleString('default', { month: 'long' });
        const year = parseInt(req.query.year) || new Date().getFullYear();

        // Build payroll summary per employee
        const payrollSummaries = await Promise.all(
            employees.map(async (employee) => {
                const payroll = await Payroll.findOne({
                    employeeId: employee._id,
                    month,
                    year
                });

                return {
                    employeeId: employee._id,
                    name: employee.name,
                    designation: employee.designation,
                    jobTitle: employee.jobTitle,
                    department: employee.department,
                    basicSalary: employee.salary,
                    ctc: payroll?.ctc || employee.salary,
                    inHandSalary: payroll?.inHandSalary || employee.salary,
                    totalEarnings: payroll?.earnings?.totalEarnings || 0,
                    totalDeductions: payroll?.deductions?.total || 0,
                    leaves: payroll?.leaves?.length || 0,
                    status: payroll?.status || 'Not Generated'
                };
            })
        );

        res.json(payrollSummaries);
    } catch (error) {
        console.error('Admin Payroll Error:', error);
        res.status(500).json({ message: error.message });
    }
};
