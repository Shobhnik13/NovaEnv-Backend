const Enviornment = require("../models/EnviornmentSchema")
const Project = require("../models/ProjectSchema")
const User = require("../models/UserSchema")

const listProjectById = async (req, res) => {
    const { projectId } = req.params
    const user = await User.findOne({ clerkId: req.user.clerkId })
    const project = await Project.findOne({ projectId: projectId, userId: user?._id })
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const envs = await Enviornment.find({ projectId: project?._id })
    if (envs.length === 0) {
        return res.status(404).json({ error: 'No enviornments found for this project' });
    }
    res.json({
        success: true,
        data: envs
    });
}

module.exports = { listProjectById }