import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Employee from '../../models/employee.model.js';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for multer
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 
                       'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed.'), false);
  }
};

// Configure multer upload
export const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('document');

// Employee uploads document 
export const addDocument = async (req, res) => {
    try {
        const employeeId = req.employee?._id;
        const { documentType, additionalInfo } = req.body;

        // Validate required fields
        if (!documentType || !req.file) {
            return res.status(400).json({ 
                message: 'Document type and file are required' 
            });
        }

        // Define allowed document types with their specific validations
        const ALLOWED_DOCUMENT_TYPES = {
            OFFER_LETTER: 'OFFER_LETTER',
            BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
            GUARANTOR_FORM: 'GUARANTOR_FORM',
            DEGREE_CERTIFICATE: 'DEGREE_CERTIFICATE',
            OTHER: 'OTHER'
        };

        // Validate document type
        if (!Object.values(ALLOWED_DOCUMENT_TYPES).includes(documentType)) {
            return res.status(400).json({
                message: 'Invalid document type',
                allowedTypes: Object.values(ALLOWED_DOCUMENT_TYPES)
            });
        }

        // Construct document metadata
        const newDocument = {
            documentType,
            filePath: `/uploads/documents/${req.file.filename}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date(),
            status: 'PENDING_REVIEW',
            additionalInfo: additionalInfo ? JSON.parse(additionalInfo) : {}
        };

        // Update employee record
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { 
                $push: { 
                    documents: {
                        $each: [newDocument],
                        $sort: { uploadedAt: -1 } // Keep documents sorted by upload date
                    } 
                } 
            },
            { 
                new: true,
                select: 'documents'
            }
        );

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: newDocument,
            documents: updatedEmployee.documents
        });

    } catch (error) {
        console.error('Error adding document:', error);
        
        // Clean up uploaded file if error occurred
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error deleting uploaded file:', err);
            }
        }

        res.status(500).json({ 
            message: 'Failed to upload document',
            error: error.message,
            ...(error.errors && { detailedErrors: error.errors })
        });
    }
};

// Admin downloads document
export const downloadDocument = async (req, res) => {
    try {
        const { employeeId, documentId } = req.params;

        // Check if requester is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const document = employee.documents.id(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const filePath = path.join('public', document.filePath);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, document.originalName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ message: 'Error downloading file' });
            }
        });

    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ 
            message: 'Failed to download document',
            error: error.message
        });
    }
};