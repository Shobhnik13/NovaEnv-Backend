const Enviornment = require("../models/EnviornmentSchema");
const Project = require("../models/ProjectSchema");
const User = require("../models/UserSchema");
const Variable = require("../models/VariableSchema");


const listEnviornments = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth;
        const { projectId } = req.params;

        const user = await User.findOne({ clerkId });
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Use custom projectId to find project belonging to user
        const project = await Project.findOne({ projectId, userId: user._id });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Find environments using custom projectId
        const enviornments = await Enviornment.find({ projectId }).sort({ createdAt: -1 });

        // Attach variable counts using custom enviornmentId (not _id)
        const environmentsWithCounts = await Promise.all(
            enviornments.map(async (env) => {
                const variableCount = await Variable.countDocuments({ enviornmentId: env.enviornmentId });
                return {
                    ...env.toObject(),
                    variableCount
                };
            })
        );

        res.json(environmentsWithCounts);
    } catch (error) {
        console.error('Get environments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createEnviornment = async () => {
    try {
        const { userId: clerkId } = req.auth;
        const { projectId } = req.params;
        const { name, description } = req.body;
        const user = await User.findOne({ clerkId });

        if (!name) {
            return res.status(400).json({ error: 'Environment name is required' });
        }

        // Verify project ownership
        const project = await Project.findOne({ projectId: projectId, userId: user._id });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const environment = new Environment({
            name,
            description: description || '',
            projectId
        });

        await environment.save();
        res.status(201).json(environment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Environment name already exists in this project' });
        }
        console.error('Create environment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const editEnviornment = async () => {
    try {
        const { userId: clerkId } = req.auth;
        const { enviornmentId } = req.params;
        const { name, description } = req.body;
        const user = await User.findOne({ clerkId });

        const enviornment = await Enviornment.findOne({ enviornmentId: enviornmentId }).populate('projectId');
        if (!enviornment) {
            return res.status(404).json({ error: 'enviornment not found' });
        }

        // Verify project ownership
        if (enviornment.projectId.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        enviornment.name = name || enviornment.name;
        enviornment.description = description !== undefined ? description : enviornment.description;
        enviornment.updatedAt = new Date();

        await enviornment.save();
        res.json(enviornment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Environment name already exists in this project' });
        }
        console.error('Update environment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const deleteEnviornment = async () => {
    try {
        const { userId: clerkId } = req.auth;
        const { enviornmentId } = req.params;
        const user = await User.findOne({ clerkId });

        const enviornment = await Enviornment.findOne({ enviornmentId: enviornmentId }).populate('projectId');
        if (!enviornment) {
            return res.status(404).json({ error: 'enviornment not found' });
        }

        // Verify project ownership
        if (enviornment.projectId.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await Variable.deleteMany({ enviornmentId });

        await Enviornment.findByIdAndDelete(enviornment._id);

        res.json({ message: 'enviornment deleted successfully' });
    } catch (error) {
        console.error('Delete environment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createEnviornment,
    listEnviornments,
    editEnviornment,
    deleteEnviornment
}