import Task from "../../models/task.model.js";
import Project from "../../models/project.model.js";
// import Employee from "../models/employee.model.js";

// Get all projects for the logged-in employee
export const getMyProjects = async (req, res) => {
    try {
        const employeeId = req.employee._id; // Assuming you have employee info in req after auth
        
        const projects = await Project.find({
            $or: [
                { projectLeader: employeeId },
                { projectMembers: employeeId }
            ]
        })
        .populate('projectLeader', 'name email')
        .populate('projectMembers', 'name email');

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch projects', 
            details: error.message 
        });
    }
};

// Create a new task for today
export const createTodayTask = async (req, res) => {
    try {
        const employeeId = req.employee._id;
        const { projectId, taskDescription } = req.body;

        // Validate the employee is part of the project
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { projectLeader: employeeId },
                { projectMembers: employeeId }
            ]
        });

        if (!project) {
            return res.status(403).json({ 
                error: 'You are not part of this project or project does not exist' 
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if task already exists for today
        const existingTask = await Task.findOne({
            employee: employeeId,
            project: projectId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingTask) {
            return res.status(400).json({ 
                error: 'You already have a task for today in this project. Please update it instead.' 
            });
        }

        const newTask = new Task({
            employee: employeeId,
            project: projectId,
            taskDescription,
            status: 'Not Started'
        });

        await newTask.save();

        const populatedTask = await Task.findById(newTask._id)
            .populate('project', 'name')
            .populate('employee', 'name email');

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to create task', 
            details: error.message 
        });
    }
};

// Update task status or description
export const updateTask = async (req, res) => {
    try {
        const employeeId = req.employee._id;
        const { taskId } = req.params;
        const { taskDescription, status, comments } = req.body;

        const task = await Task.findOne({
            _id: taskId,
            employee: employeeId
        });

        if (!task) {
            return res.status(404).json({ 
                error: 'Task not found or you are not authorized to update it' 
            });
        }

        // Only allow updates to today's task
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        if (task.date < today || task.date >= tomorrow) {
            return res.status(400).json({ 
                error: 'You can only update tasks for today' 
            });
        }

        if (taskDescription) task.taskDescription = taskDescription;
        if (status) task.status = status;
        if (comments) task.comments = comments;

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('project', 'name')
            .populate('employee', 'name email');

        res.status(200).json(populatedTask);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to update task', 
            details: error.message 
        });
    }
};

// Get all tasks for the logged-in employee
export const getMyTasks = async (req, res) => {
    try {
        const employeeId = req.employee._id;
        const { date, projectId, status } = req.query;

        const filter = { employee: employeeId };

        if (date) {
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
            
            filter.date = {
                $gte: selectedDate,
                $lt: nextDay
            };
        }

        if (projectId) filter.project = projectId;
        if (status) filter.status = status;

        const tasks = await Task.find(filter)
            .populate('project', 'name')
            .sort({ date: -1 });

        res.json({
            success: true,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch tasks', 
            details: error.message 
        });
    }
};

// Admin: Get all tasks for a specific project
export const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { date, employeeId, status } = req.query;

        const filter = { project: projectId };

        if (date) {
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
            
            filter.date = {
                $gte: selectedDate,
                $lt: nextDay
            };
        }

        if (employeeId) filter.employee = employeeId;
        if (status) filter.status = status;

        const tasks = await Task.find(filter)
            .populate('project', 'name')
            .populate('employee', 'name email')
            .sort({ date: -1 });

        res.json({
            success: true,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch project tasks', 
            details: error.message 
        });
    }
};