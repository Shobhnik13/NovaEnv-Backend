const Enviornment = require("../models/EnviornmentSchema");
const Project = require("../models/ProjectSchema");
const User = require("../models/UserSchema");
const Variable = require("../models/VariableSchema");
const { decryptData } = require("../utils/DecryptData");


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

const createEnviornment = async (req, res) => {
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

        const environment = new Enviornment({
            name,
            description: description || '',
            projectId: project._id,
        });

        await environment.save();
        res.status(200).json('Environment created successfully');
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Environment name already exists in this project' });
        }
        console.error('Create environment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const editEnviornment = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth;
        const { enviornmentId } = req.params;
        const { name } = req.body;
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
        enviornment.updatedAt = new Date();

        await enviornment.save();
        res.status(200).json({ message: "Enviornment updated successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Environment name already exists in this project' });
        }
        console.error('Update environment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const deleteEnviornment = async (req, res) => {
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

        await Variable.deleteMany({ enviornmentId: enviornment?._id });

        await Enviornment.findByIdAndDelete(enviornment._id);

        res.json({ message: 'enviornment deleted successfully' });
    } catch (error) {
        console.error('Delete environment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const listEnviornmentById = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth
        const { enviornmentId, projectId } = req.params;

        const user = await User.findOne({ clerkId })

        const enviornment = await Enviornment.findOne({ enviornmentId: enviornmentId }).populate('projectId');
        if (!enviornment) {
            return res.status(404).json({ error: 'enviornment not found' });
        }

        if (enviornment.projectId.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const variables = await Variable.find({ enviornmentId: enviornment._id }).select('key value variableId -_id').sort({ updatedAt: -1 });;
        const decryptedVariables = await Promise.all(
            variables.map(async (variable) => ({
                key: await decryptData(variable.key),
                value: await decryptData(variable.value),
                variableId: variable.variableId
            }))
        );
        return res.status(200).json({
            enviornmentId: enviornment.enviornmentId,
            name: enviornment.name,
            variables: decryptedVariables
        });
    } catch (error) {
        console.error('Fetch environment by id error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createEnviornment,
    listEnviornments,
    editEnviornment,
    deleteEnviornment,
    listEnviornmentById
}