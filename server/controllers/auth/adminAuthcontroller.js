import User from "../../models/user.model.js"
import Employee from '../../models/employee.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from "../../helpers/utils.js";


export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate email domain
        if (!email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: 'Only Gmail addresses are allowed for registration' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Generate JWT token
        generateToken(newUser._id, res);

        // Return success response with user data
        res.status(201).json({
            message: 'Registration successful',
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required' 
            });
        }

        // Determine user type and authenticate
        const isAdmin = email.endsWith('@gmail.com');
        const userModel = isAdmin ? User : Employee;
        const user = await userModel.findOne({ email }).select('+password');

        // Authentication checks
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' // Generic message for security
            });
        }

        // Check if employee is active
        if (!isAdmin && !user.active) {
            return res.status(403).json({ 
                success: false,
                message: 'Account inactive',
                details: 'Please contact HR or Admin for assistance' 
            });
        }

        // Verify password
        const isPasswordValid = isAdmin 
            ? await user.comparePassword(password)
            : await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Generate token and prepare user data
        const token = generateToken(user._id, isAdmin ? user.role : 'employee', res);
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: isAdmin ? user.role : 'employee'
        };

        // Add employee-specific fields if needed
        if (!isAdmin) {
            userData.position = user.position;
            userData.department = user.department;
        }

        // Successful response
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const logoutUser = async (req, res) => {
    try {
        // Clear the JWT cookie
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};