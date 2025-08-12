const Enviornment = require("../models/EnviornmentSchema")
const Project = require("../models/ProjectSchema")
const User = require("../models/UserSchema")
const Variable = require("../models/VariableSchema")
const { decryptData } = require("../utils/DecryptData")

const listVariables = async (req, res) => {
    const { projectId, enviornmentId } = req.params
    const user = await User.findOne({ clerkId: req.user.clerkId })
    const project = await Project.findOne({ projectId: projectId, userId: user?._id })
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const env = await Enviornment.findOne({ enviornmentId: enviornmentId, projectId: project?._id })
    if (!env) {
        return res.status(404).json({ error: 'Enviornmnent not found under this project' });
    }
    const vars = await Variable.find({ enviornmentId: env?._id })
    const decryptedVars = await Promise.all(vars.map(async (v) => {
        const decryptedValue = await decryptData(v.value)
        const decryptedKey = await decryptData(v.key)
        return `${decryptedKey}=${decryptedValue}`
    }))
    
    res.json({
        success: true,
        data: decryptedVars
    });
}

module.exports = { listVariables }