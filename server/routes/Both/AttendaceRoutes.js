import express from 'express';
import {
  clockIn,
  breakIn,
  breakOut,
  clockOut,
  getLogs,
  getTodayStatus,
  getEmployeeList,
  getEmployeeAttendanceDetails
} from '../../controllers/attendance/attendanceController.js';

import isAuthenticated from '../../middlewares/isAuthenticated.js';
import isAdminAuthenticated from '../../middlewares/isAdminAuthenticated.js';

const router = express.Router();

// Employee actions
router.route("/clock-in").post(isAuthenticated, clockIn);
router.route("/break-in").post(isAuthenticated, breakIn);
router.route("/break-out").post(isAuthenticated, breakOut);
router.route("/clock-out").post(isAuthenticated, clockOut);
router.route("/get-logs").get(isAuthenticated, getLogs);

// Employee data endpoints
router.route("/all-employee-list")
  .get(isAdminAuthenticated, getEmployeeList); // Get list of all employees

router.route("/employee/:employeeId/attendance")
  .get(isAdminAuthenticated, getEmployeeAttendanceDetails); // Get specific employee attendance

// Admin-only endpoints
router.route("/today-status").get(isAdminAuthenticated, getTodayStatus);

export default router;