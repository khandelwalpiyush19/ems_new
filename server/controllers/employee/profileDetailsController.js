import Employee from '../../models/employee.model.js';
import mongoose from 'mongoose';

// Employee updates their additional information
// Employee updates their additional information
export const updateEmployeeInfo = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const updateData = req.body;

        // Fields that cannot be updated through this endpoint
        const restrictedFields = [
            'name', 'lastName', 'email', 'password', 'position', 
            'department', 'manager', 'jobTitle', 'jobCategory', 
            'salary', 'role', 'active', 'guarantors', 'nextOfKins',
            'familyDetails', 'academicRecords', 'professionalQualifications'
        ];

        // Check if update includes restricted fields
        const invalidUpdates = Object.keys(updateData).filter(
            field => restrictedFields.includes(field)
        );

        if (invalidUpdates.length > 0) {
            return res.status(400).json({
                message: `Cannot update restricted fields: ${invalidUpdates.join(', ')}`
            });
        }

        // Validate phone numbers if provided
        if (updateData.phone1) {
            if (!/^\d{10,15}$/.test(updateData.phone1)) {
                return res.status(400).json({ message: 'Phone1 must be 10-15 digits' });
            }
        }

        if (updateData.phone2) {
            if (!/^\d{10,15}$/.test(updateData.phone2)) {
                return res.status(400).json({ message: 'Phone2 must be 10-15 digits' });
            }
        }

        // Validate personal email if provided
        if (updateData.personalEmail) {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(updateData.personalEmail)) {
                return res.status(400).json({ message: 'Please provide a valid personal email' });
            }
        }

        // Update the employee document
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $set: updateData },
            { 
                new: true, 
                runValidators: true,
                fields: { 
                    password: 0,
                    ...Object.fromEntries(restrictedFields.map(field => [field, 0]))
                }
            }
        ).select('-password');

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            message: 'Employee information updated successfully',
            employee: updatedEmployee
        });

    } catch (error) {
        console.error('Error updating employee info:', error);
        res.status(500).json({ 
            message: 'Failed to update employee information',
            error: error.message,
            ...(error.errors && { detailedErrors: error.errors })
        });
    }
};

// Employee adds academic records (max 3)
export const addAcademicRecord = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const { institution, details } = req.body;

        if (!institution || !details) {
            return res.status(400).json({ message: 'Institution and details are required' });
        }

        // Check current count of academic records
        const employee = await Employee.findById(employeeId);
        if (employee.academicRecords.length >= 3) {
            return res.status(400).json({ 
                message: 'Maximum limit of 3 academic records reached' 
            });
        }

        const newRecord = { institution, details };

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $push: { academicRecords: newRecord } },
            { new: true }
        ).select('academicRecords');

        res.status(201).json({
            message: 'Academic record added successfully',
            academicRecords: updatedEmployee.academicRecords
        });

    } catch (error) {
        console.error('Error adding academic record:', error);
        res.status(500).json({ 
            message: 'Failed to add academic record',
            error: error.message
        });
    }
};

// Employee adds/updates guarantor (only 1 allowed)
export const addGuarantorDetails = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const { name, occupation, phone, relationship, address } = req.body;

        // Validate required fields
        if (!name || !occupation || !phone) {
            return res.status(400).json({ 
                message: 'Name, occupation and phone are required' 
            });
        }

        // Validate phone number format
        if (!/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({ 
                message: 'Phone must be 10-15 digits' 
            });
        }

        const newGuarantor = { 
            name,
            occupation,
            phone,
            relationship: relationship || 'Relative',
            address: address || '',
            addedAt: new Date()
        };

        // Use $set to replace the entire guarantors array with just the new one
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $set: { guarantors: [newGuarantor] } }, // Only one guarantor allowed
            { new: true }
        ).select('guarantors');

        res.status(201).json({
            message: 'Guarantor details updated successfully',
            guarantors: updatedEmployee.guarantors
        });

    } catch (error) {
        console.error('Error adding guarantor details:', error);
        res.status(500).json({ 
            message: 'Failed to update guarantor details',
            error: error.message
        });
    }
};

// Employee adds professional qualification
  export const addProfessionalQualification = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const { title, organization, duration, description } = req.body;

        if (!title || !organization) {
            return res.status(400).json({ message: 'Title and organization are required' });
        }

        const newQualification = { 
            title, 
            organization, 
            duration: duration || '', 
            description: description || '' 
        };

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $push: { professionalQualifications: newQualification } },
            { new: true }
        ).select('professionalQualifications');

        res.status(201).json({
            message: 'Professional qualification added successfully',
            professionalQualifications: updatedEmployee.professionalQualifications
        });

    } catch (error) {
        console.error('Error adding professional qualification:', error);
        res.status(500).json({ 
            message: 'Failed to add professional qualification',
            error: error.message
        });
    }
};

// Employee adds/updates next of kin (only 1 allowed)
export const addNextOfKin = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const { name, occupation, phone, relationship, address } = req.body;

        // Validate required fields
        if (!name || !relationship || !phone) {
            return res.status(400).json({ 
                message: 'Name, relationship and phone are required' 
            });
        }

        // Validate phone number format
        if (!/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({ 
                message: 'Phone must be 10-15 digits' 
            });
        }

        const newNextOfKin = {
            name,
            occupation: occupation || '',
            phone,
            relationship,
            address: address || '',
            addedAt: new Date()
        };

        // Use $set to replace the entire nextOfKins array with just the new one
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $set: { nextOfKins: [newNextOfKin] } }, // Only one next of kin allowed
            { new: true }
        ).select('nextOfKins');

        res.status(201).json({
            message: 'Next of kin updated successfully',
            nextOfKins: updatedEmployee.nextOfKins
        });

    } catch (error) {
        console.error('Error adding next of kin:', error);
        res.status(500).json({ 
            message: 'Failed to update next of kin',
            error: error.message
        });
    }
};

// Employee adds family details (max 4)
export const addFamilyDetail = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const { fullName, relationship, phoneNo, address, occupation } = req.body;

        if (!fullName || !relationship) {
            return res.status(400).json({ message: 'Full name and relationship are required' });
        }

        // Check current count of family details
        const employee = await Employee.findById(employeeId);
        if (employee.familyDetails.length >= 4) {
            return res.status(400).json({ 
                message: 'Maximum limit of 4 family members reached' 
            });
        }

        const newFamilyMember = { 
            fullName, 
            relationship,
            phoneNo: phoneNo || '',
            address: address || '',
            occupation: occupation || ''
        };

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $push: { familyDetails: newFamilyMember } },
            { new: true }
        ).select('familyDetails');

        res.status(201).json({
            message: 'Family detail added successfully',
            familyDetails: updatedEmployee.familyDetails
        });

    } catch (error) {
        console.error('Error adding family detail:', error);
        res.status(500).json({ 
            message: 'Failed to add family detail',
            error: error.message
        });
    }
};

// Employee updates financial details
export const updateFinancialDetails = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const { bankName, ifsc, accountNo, accountName } = req.body;

        if (!bankName || !ifsc || !accountNo || !accountName) {
            return res.status(400).json({ message: 'All financial details are required' });
        }

        // Basic validation
        if (!/^[A-Za-z0-9]{4,20}$/.test(ifsc)) {
            return res.status(400).json({ message: 'Invalid IFSC format' });
        }

        if (!/^\d{9,18}$/.test(accountNo)) {
            return res.status(400).json({ message: 'Account number must be 9-18 digits' });
        }

        const financialDetails = { bankName, ifsc, accountNo, accountName };

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { financialDetails },
            { new: true }
        ).select('financialDetails');

        res.status(200).json({
            message: 'Financial details updated successfully',
            financialDetails: updatedEmployee.financialDetails
        });

    } catch (error) {
        console.error('Error updating financial details:', error);
        res.status(500).json({ 
            message: 'Failed to update financial details',
            error: error.message
        });
    }
};

// Admin gets employee's additional information

export const getEmployeeInfoByAdmin = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }

    // Fetch employee and include active status
    const employee = await Employee.findById(employeeId)
      .select('-password -role'); // ❗Keep active field by NOT excluding it

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ employee });

  } catch (error) {
    console.error('Error fetching employee info:', error);
    res.status(500).json({ 
      message: 'Failed to fetch employee information',
      error: error.message
    });
  }
};

export const getEmployeeInfoByEmployee = async (req, res) => {
    try {
        const employeeId = req.employee?._id;

        if (!employeeId) {
            return res.status(401).json({ 
                message: 'Unauthorized. Please log in.' 
            });
        }

        const requestedId = req.params.employeeId;
        if (requestedId && requestedId !== employeeId.toString()) {
            return res.status(403).json({ 
                message: 'Forbidden. You can only access your own data.' 
            });
        }

        const employee = await Employee.findById(employeeId)
            .select('-password -active -role -salary -manager')
            .select('guarantors nextOfKins familyDetails academicRecords professionalQualifications');

        if (!employee) {
            return res.status(404).json({ 
                message: 'Employee not found.' 
            });
        }

        res.status(200).json({
            message: 'Your information has been retrieved successfully.',
            employee,
        });

    } catch (error) {
        console.error('Error fetching employee info:', error);
        res.status(500).json({ 
            message: 'Failed to fetch employee data.',
            error: error.message,
        });
    }
};

