import nodemailer from 'nodemailer';
import crypto from 'crypto';
import Employee from '../../models/employee.model.js';
import bcrypt from 'bcryptjs';

// Helper function to generate reset token
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Case-insensitive email search
    const employee = await Employee.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { resetToken, hashedToken } = generateResetToken();
    
    employee.resetPasswordToken = hashedToken;
    employee.resetPasswordExpire = Date.now() + 1000 * 60 * 15; // 15 mins
    await employee.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      to: employee.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${employee.name},</p>
        <p>You requested a password reset. Click the link below to proceed:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({ message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const employee = await Employee.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!employee) {
      return res.status(400).json({ 
        message: 'Invalid or expired token. Please request a new password reset.' 
      });
    }

    // Hash new password before saving
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(req.body.password, salt);
    employee.resetPasswordToken = undefined;
    employee.resetPasswordExpire = undefined;
    employee.mustResetPassword = false; // Reset the forced password change flag
    await employee.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};