import express from "express";
import { getAllLeaves, getLeaveStatistics, updateLeaveStatus } from "../../controllers/leave/leaveAdminController.js";
import isAdminAuthenticated from "../../middlewares/isAdminAuthenticated.js";
 

const router = express.Router();
 
router.route("/get-all-leaves").get(isAdminAuthenticated,getAllLeaves)
router.route("/update-leave-status/:id").put(isAdminAuthenticated,updateLeaveStatus)
router.route("/get-leave-statistics/:employeeId").get(isAdminAuthenticated,getLeaveStatistics)




export default router;