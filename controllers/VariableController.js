const Enviornment = require("../models/EnviornmentSchema");
const Project = require("../models/ProjectSchema");
const User = require("../models/UserSchema");
const Variable = require("../models/VariableSchema");
const { encryptData } = require('../utils/EncryptData')

const createVariables = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth
        const { projectId, enviornmentId } = req.params
        const { key, value } = req.body
        
        const user = await User.findOne({ clerkId })
        const enviornment = await Enviornment.findOne({ enviornmentId: enviornmentId }).populate('projectId');
        const project = await Project.findOne({ projectId: projectId })

        if (!enviornment) {
            return res.status(404).json({ error: 'enviornment not found' });
        }

        if (enviornment.projectId.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // verified ownership of project's env
        // now adding the env 
        // extracting and encrypting it then storing in db
        const encryptedValue = await encryptData(value)
        const encryptedKey = await encryptData(key)
        const variable = new Variable({
            enviornmentId: enviornment?._id,
            projectId: project?._id,
            key: encryptedKey,
            value: encryptedValue,
        })
        await variable.save();

        return res.status(200).json({ message: "Variable added successfully." })
    } catch (error) {
        console.error('Variable create error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while creating variable'
        });
    }
}

const listVariables = async () => {

}


module.exports = {
    createVariables,
    listVariables
}