import express from 'express';
import { 
    addDocument, 
    downloadDocument,
    upload
} from '../../controllers/fileUpload/uploadConfigController.js';
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAdminAuthenticated from './../../middlewares/isAdminAuthenticated.js';

const router = express.Router();

// Employee uploads documents (employeeId from authenticated user, not URL)
router.post(
    '/document-upload',
    isAuthenticated,
    (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    addDocument // This controller should use req.employee._id instead of req.params.employeeId
);

// Admin downloads document (uses employeeId from URL)
router.get(
    '/:employeeId/documents/:documentId/download',
    isAdminAuthenticated,
    downloadDocument
);

export default router;
