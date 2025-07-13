import express from "express";
import {
    updateEmployeeInfo,
    addAcademicRecord,
    addProfessionalQualification,
    addFamilyDetail,
    updateFinancialDetails,
    addGuarantorDetails,
    addNextOfKin,
    getEmployeeInfoByAdmin,
    getEmployeeInfoByEmployee
} from "../../controllers/employee/profileDetailsController.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAdminAuthenticated from './../../middlewares/isAdminAuthenticated.js';
import { updateEmployeeStatus } from "../../controllers/auth/employeeAuthController.js";



const router = express.Router();


router.route("/update-info").put(isAuthenticated, updateEmployeeInfo);
router.route("/admin/get-info/:employeeId").get( isAdminAuthenticated, getEmployeeInfoByAdmin);
router.route("/get-my-details").get(isAuthenticated, getEmployeeInfoByEmployee);
router.route("/add-academic-record").post(isAuthenticated, addAcademicRecord);
router.route("/add-professional-qualification").post(isAuthenticated, addProfessionalQualification);
router.route("/add-family-detail").post(isAuthenticated, addFamilyDetail);
router.route("/add-guarantor-detail").post(isAuthenticated, addGuarantorDetails);
router.route("/add-nok-detail").post(isAuthenticated, addNextOfKin);
router.route("/update-financial-details").put(isAuthenticated, updateFinancialDetails);

// update status(active or inactive)
router.route("/admin/update-status/:employeeId").patch(isAdminAuthenticated,updateEmployeeStatus );



export default router;