import express from "express";
import { deleteEmployee, getAllEmployees, loginEmployee, logoutEmployee, registerEmployee, resetEmployeePassword, updateEmployeeStatus } from "../../controllers/auth/employeeAuthController.js";
import isAdminAuthenticated from './../../middlewares/isAdminAuthenticated.js';
import isAuthenticated from "../../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/register").post(registerEmployee);
router.route("/login").post(loginEmployee);
router.route("/logout").get(logoutEmployee);
router.route("/reset-password").patch(isAuthenticated,resetEmployeePassword);
router.route("/get-all-employees").get(isAdminAuthenticated,getAllEmployees);
router.route("/delete-employee/:employeeId").delete(isAdminAuthenticated,deleteEmployee)

export default router;