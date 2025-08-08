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
        res.status(200).json("Project created successfully");
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

        const projects = await Project.find({ userId: user._id })
            .select('name description projectId createdAt _id')
            .sort({ createdAt: -1 });

        const projectIds = projects.map(project => project._id);

        const [variableCounts, environmentCounts] = await Promise.all([
            Variable.aggregate([
                { $match: { projectId: { $in: projectIds } } },
                { $group: { _id: '$projectId', count: { $sum: 1 } } }
            ]),
            Enviornment.aggregate([
                { $match: { projectId: { $in: projectIds } } },
                { $group: { _id: '$projectId', count: { $sum: 1 } } }
            ])
        ]);

        const varCountMap = variableCounts.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});

        const envCountMap = environmentCounts.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});


        const projectsWithCounts = projects.map(project => ({
            name: project.name,
            description: project.description,
            projectId: project.projectId,
            totalVariables: varCountMap[project._id.toString()] || 0,
            totalEnvironments: envCountMap[project._id.toString()] || 0
        }));

        res.json(projectsWithCounts);

    } catch (error) {
        console.error('List projects error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while fetching projects'
        });
    }
}

const analytics = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth;

        // Find the user
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's projects
        const projects = await Project.find({ userId: user._id }).select('_id');
        const projectIds = projects.map(p => p._id);

        // Count items
        const projectsCount = projects.length;
        const environmentsCount = await Enviornment.countDocuments({ projectId: { $in: projectIds } });
        const variablesCount = await Variable.countDocuments({ projectId: { $in: projectIds } });

        res.json({
            projects: projectsCount,
            enviornments: environmentsCount,
            variables: variablesCount
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while fetching analytics'
        });
    }
};

const listProjectById = async (req, res) => {
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
        const project = await Project.findOne({ projectId: projectId, userId: user._id }).lean();
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const envs = await Enviornment.find({ projectId: project?._id })
        .select('name updatedAt -_id')
        .sort({ updatedAt: -1 })

        res.json({
            projectId: project.projectId,
            name: project.name,
            description: project.description,
            envs: envs.length > 0 ? envs : [],
        });
    } catch (error) {
        console.error('List project by id error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while fetching project'
        });
    }
}

const editProject = async (req, res) => {
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

const deleteProject = async (req, res) => {
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

module.exports = { createProject, listProjects, listProjectById, editProject, deleteProject, analytics };  