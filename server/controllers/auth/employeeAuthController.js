import Employee from '../../models/employee.model.js';
import { generateToken } from '../../helpers/utils.js';
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";
import sendWelcomeEmail from '../../helpers/emailSender.js';


// Generate token with employeeId instead of email
import Payroll from '../../models/payroll.model.js'; // Make sure this path is correct


// Register new employee

export const registerEmployee = async (req, res) => {
    try {
        const {
            name, lastName, email, password,
            position, department, manager,
            jobTitle, jobCategory, salary
        } = req.body;

        // Validate required fields
        if (!name || !lastName || !email || !password || !position ||
            !department || !manager || !jobTitle || !jobCategory || !salary) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate position value
        const validPositions = ["Intern", "Junior", "Mid-Level", "Senior", "Lead", "Supervisor", "Manager", "Director", "VP", "CTO", "CFO", "CEO", "Developer"];
        if (!validPositions.includes(position)) {
            return res.status(400).json({ message: 'Invalid position value' });
        }

        // Check if employee already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the employee
        const employee = new Employee({
            name,
            lastName,
            email,
            password: hashedPassword,
            position,
            department,
            manager,
            jobTitle,
            jobCategory,
            salary,
            role: 'employee',
            mustResetPassword: true
        });

        await employee.save();
 await sendWelcomeEmail(email,name);
        // Create associated default payroll
        const currentDate = new Date();
        const defaultPayroll = {
            employeeId: employee._id,
            month: currentDate.toLocaleString('default', { month: 'long' }),
            year: currentDate.getFullYear(),
            basicSalary: salary,
            earnings: {
                basicWage: salary,
                houseRentAllowance: 0,
                overtime: 0,
                gratuity: 0,
                specialAllowance: 0,
                pfEmployer: 0,
                esiEmployer: 0
            },
            deductions: {
                pfEmployee: 0,
                esiEmployee: 0,
                tax: 0,
                otherDeductions: 0
            },
            ctc: 0,
            inHandSalary: 0,
            status: 'Pending'
        };

        await Payroll.create(defaultPayroll);

        // Generate token and send response
        const token = generateToken(employee._id);
        res.status(201).json({
            message: 'Employee registered successfully',
            token,
            employee: {
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                position: employee.position,
                jobTitle: employee.jobTitle
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Registration failed',
            error: error.message,
            ...(error.errors && { detailedErrors: error.errors })
        });
    }
};

// Login employee
export const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!employee.active) {
            return res.status(403).json({ message: 'Your account is inactive. Please contact HR or Admin.' });
        }

        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // ✅ Pass `res` and `role` so cookie gets set
        const token = generateToken(employee._id, "employee", res);

        res.status(200).json({
            message: 'Login successful',
            token,
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                position: employee.position,
                department: employee.department,
                jobTitle: employee.jobTitle,
                mustResetPassword: employee.mustResetPassword
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

export const logoutEmployee = (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Logout failed', error: error.message });
    }
};

//get all employees
export const getAllEmployees = async (req, res) => {
    try {
        const user = req.user || req.employee;

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const employees = await Employee.find().select('-password');
        res.status(200).json({ employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
    }
};

// Update employee active status (Admin only)
export const updateEmployeeStatus = async (req, res) => {
    try {
        // Check if requester is admin
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { employeeId } = req.params;
        const { active } = req.body;

        // Validate input
        if (typeof active !== 'boolean') {
            return res.status(400).json({ message: 'Invalid status. Must be true/false.' });
        }

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        // Update status
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { active },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            message: `Employee ${active ? 'activated' : 'deactivated'} successfully`,
            employee: updatedEmployee
        });

    } catch (error) {
        console.error('Error updating employee status:', error);
        res.status(500).json({
            message: 'Failed to update employee status',
            error: error.message
        });
    }
};
export const resetEmployeePassword = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            {
                password: hashedPassword,
                mustResetPassword: false
            },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};

// Delete employee (Admin only)
export const deleteEmployee = async (req, res) => {
    try {
        // Ensure requester is an admin
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { employeeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const employee = await Employee.findByIdAndDelete(employeeId);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Optionally delete associated payroll data (if needed)
        await Payroll.deleteMany({ employeeId: employee._id });

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Failed to delete employee', error: error.message });
    }
};
