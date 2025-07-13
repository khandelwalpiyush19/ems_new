import Project from "../../models/project.model.js";
import Employee from "../../models/employee.model.js";

// Get all projects with populated leader and members
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('projectLeader', 'name email role')
            .populate('projectMembers', 'name email role');
       res.json({
  success: true,
  projects: [projects]
});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects', details: error.message });
    }
};

// Create a new project with validation
export const createProject = async (req, res) => {
    try {
        const { name, projectLeader, projectMembers, status } = req.body;

        // Validate project leader exists
        const leaderExists = await Employee.exists({ _id: projectLeader });
        if (!leaderExists) {
            return res.status(400).json({ error: 'Project leader not found' });
        }

        // Validate all members exist
        if (projectMembers && projectMembers.length > 0) {
            const membersExist = await Employee.countDocuments({ 
                _id: { $in: projectMembers } 
            });
            if (membersExist !== projectMembers.length) {
                return res.status(400).json({ error: 'One or more project members not found' });
            }
        }

        const newProject = new Project({
            name,
            projectLeader,
            projectMembers: projectMembers || [],
            status
        });

        await newProject.save();
        
        // Return populated project data
        const populatedProject = await Project.findById(newProject._id)
            .populate('projectLeader', 'name email')
            .populate('projectMembers', 'name email');

        res.status(201).json(populatedProject);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to create project',
            details: error.message 
        });
    }
};

// Update a project with validation
export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, projectLeader, projectMembers, status } = req.body;

        // Validate leader if being updated
        if (projectLeader) {
            const leaderExists = await Employee.exists({ _id: projectLeader });
            if (!leaderExists) {
                return res.status(400).json({ error: 'New project leader not found' });
            }
        }

        // Validate members if being updated
        if (projectMembers) {
            const membersExist = await Employee.countDocuments({ 
                _id: { $in: projectMembers } 
            });
            if (membersExist !== projectMembers.length) {
                return res.status(400).json({ error: 'One or more project members not found' });
            }
        }

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { 
                name, 
                ...(projectLeader && { projectLeader }),
                ...(projectMembers && { projectMembers }),
                status,
                updatedAt: Date.now() 
            },
            { new: true }
        ).populate('projectLeader', 'name email')
         .populate('projectMembers', 'name email');

        if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to update project',
            details: error.message 
        });
    }
};

// Delete a project
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProject = await Project.findByIdAndDelete(id);
        
        if (!deletedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ 
            message: 'Project deleted successfully',
            deletedProject 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to delete project',
            details: error.message 
        });
    }
};