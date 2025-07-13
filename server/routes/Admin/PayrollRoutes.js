
import express from "express";
import { getAllEmployeesPayroll, getAllPayrolls, getEmployeePayroll, updatePayroll } from "../../controllers/admin/payrollController.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAdminAuthenticated from "../../middlewares/isAdminAuthenticated.js";




const router = express.Router();


router.route("/update-payroll/:id").put(isAdminAuthenticated,updatePayroll)
 
router.route("/get-employee-payroll").get(isAuthenticated,getEmployeePayroll)
router.route("/get-all-payroll").get(isAuthenticated,getAllPayrolls)
router.route("/get-all-employee-payroll").get(isAdminAuthenticated,getAllEmployeesPayroll)

export default router;