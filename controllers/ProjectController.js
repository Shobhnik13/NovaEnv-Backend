const Enviornment = require("../models/EnviornmentSchema");
const Project = require("../models/ProjectSchema");
const User = require("../models/UserSchema");
const Variable = require("../models/VariableSchema");


const createProject = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const project = new Project({
            name,
            description: description || '',
            userId: user._id
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while creating project'
        });
    }
}

const listProjects = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth
        const user = await User.findOne({ clerkId })
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const projects = await Project.find({ userId: user._id }).sort({ createdAt: -1 });
        res.json(projects)
    } catch (error) {
        console.error('List projects error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while fetching projects'
        });
    }
}

const listProjectById = async () => {
    try {
        const { userId: clerkId } = req.auth
        const { projectId } = req.params
        if (!projectId) {
            return res.status(404).json({ error: "Project Id is required" })
        }
        const user = await User.findOne({ clerkId })
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const project = await Project.findOne({ projectId: projectId, userId: user._id });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project)
    } catch (error) {
        console.error('List project by id error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while fetching project'
        });
    }
}

const editProject = async () => {
    try {
        const { userId: clerkId } = req.auth
        const { projectId } = req.params
        if (!projectId) {
            return res.status(404).json({ error: "Project Id is required" })
        }
        const user = await User.findOne({ clerkId })
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { name, description } = req.body
        const updateFields = {}
        if (name !== undefined) {
            const trimmedName = name.trim();
            if (trimmedName) {
                updateFields.name = trimmedName;
            }
        }

        if (description !== undefined) {
            const trimmedDescription = description.trim();
            updateFields.description = trimmedDescription;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        updateFields.updatedAt = new Date();
        const project = await Project.findOneAndUpdate({
            projectId: projectId,
            uderId: user?._id
        },
            updateFields,
            { new: true }
        )

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Edit project error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while editing project'
        });
    }
}

const deleteProject = async () => {
    try {
        const { userId: clerkId } = req.auth;
        const { projectId } = req.params;
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const project = await Project.findOne({ _id: projectId, userId: user._id });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await Variable.deleteMany({ projectId: projectId })
        await Enviornment.deleteMany({ projectId: projectId })
        await Project.deleteMany({ projectId: projectId })
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while deleting project'
        });
    }
}

module.exports = { createProject, listProjects, listProjectById, editProject, deleteProject };  