import express from "express";
import {
    getMyProjects,
    createTodayTask,
    updateTask,
    getMyTasks,
    getProjectTasks
} from "../../controllers/employee/employeeTaskController.js";
import isAuthenticated from './../../middlewares/isAuthenticated.js';
import isAdminAuthenticated from './../../middlewares/isAdminAuthenticated.js';

const router = express.Router();

// Employee routes
router.get("/get-my-projects", isAuthenticated, getMyProjects);
router.post("/create-task", isAuthenticated, createTodayTask);
router.put("/task-status/:taskId", isAuthenticated, updateTask);
router.get("/all-tasks", isAuthenticated, getMyTasks);

// Admin routes
router.get("/admin/projects/:projectId/tasks", isAdminAuthenticated,getProjectTasks); // Add admin auth middleware if needed

export default router;