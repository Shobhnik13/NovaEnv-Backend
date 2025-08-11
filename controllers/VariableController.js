const Enviornment = require("../models/EnviornmentSchema");
const Project = require("../models/ProjectSchema");
const User = require("../models/UserSchema");
const Variable = require("../models/VariableSchema");
const { encryptData } = require('../utils/EncryptData')

const createVariables = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth
        const { projectId, enviornmentId } = req.params
        const { key, value, variables } = req.body

        const user = await User.findOne({ clerkId })
        const enviornment = await Enviornment.findOne({ enviornmentId: enviornmentId }).populate('projectId');
        const project = await Project.findOne({ projectId: projectId })

        if (!enviornment) {
            return res.status(404).json({ error: 'enviornment not found' });
        }

        if (enviornment.projectId.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Determine if this is a single variable or bulk insert
        let variablesToCreate = [];

        if (variables && Array.isArray(variables) && variables.length > 0) {
            // Bulk insert mode
            // Validate that all variables have key and value
            for (const variable of variables) {
                if (!variable.key || !variable.value) {
                    return res.status(400).json({
                        error: 'Invalid data',
                        message: 'All variables must have both key and value'
                    });
                }
            }
            variablesToCreate = variables;
        } else if (key && value) {
            // Single variable mode
            variablesToCreate = [{ key, value }];
        } else {
            return res.status(400).json({
                error: 'Invalid data',
                message: 'Either provide key and value for single variable, or variables array for bulk insert'
            });
        }



        // Encrypt and prepare variables for insertion
        const encryptedVariables = [];
        for (const variable of variablesToCreate) {
            try {
                const encryptedValue = await encryptData(variable.value);
                const encryptedKey = await encryptData(variable.key);

                encryptedVariables.push({
                    enviornmentId: enviornment._id,
                    projectId: project._id,
                    key: encryptedKey,
                    value: encryptedValue,
                });
            } catch (encryptError) {
                return res.status(500).json({
                    error: 'Encryption failed',
                    message: `Failed to encrypt variable: ${variable.key}`
                });
            }
        }

        // Insert variables into database
        const createdVariables = await Variable.insertMany(encryptedVariables);

        // Return appropriate response based on single or bulk operation
        if (variablesToCreate.length === 1) {
            return res.status(200).json({
                message: "Variable added successfully.",
                count: 1
            });
        } else {
            return res.status(200).json({
                message: `${variablesToCreate.length} variables added successfully.`,
            });
        }

    } catch (error) {
        console.error('Variable create error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while creating variable(s)'
        });
    }
}

const updateVariable = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth
        const { enviornmentId, variableId } = req.params
        const { key, value } = req.body

        if (!key?.trim() || !value?.trim()) {
            return res.status(400).json({ error: "Key and Value are required" });
        }

        const user = await User.findOne({ clerkId })
        const enviornment = await Enviornment.findOne({ enviornmentId: enviornmentId }).populate('projectId');

        if (!enviornment) {
            return res.status(404).json({ error: 'enviornment not found' });
        }

        if (enviornment.projectId.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const encryptedKey = await encryptData(key.trim());
        const encryptedValue = await encryptData(value.trim());

        const updatedVariable = await Variable.findOneAndUpdate(
            { variableId: variableId, enviornmentId: enviornment._id },
            { key: encryptedKey, value: encryptedValue, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedVariable) {
            return res.status(404).json({ error: 'Variable not found' });
        }

        return res.status(200).json({ message: "Variable updated successfully." });
    } catch (error) {
        console.error('Variable edit error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while editing variable'
        });
    }
}

const deleteVariable = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth
        const { enviornmentId, variableId } = req.params
       
        const user = await User.findOne({ clerkId })
        const enviornment = await Enviornment.findOne({ enviornmentId: enviornmentId }).populate('projectId');
        if (!enviornment) {
            return res.status(404).json({ error: 'enviornment not found' });
        }

        if (enviornment.projectId.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (variableId.toLowerCase() === 'deleteall') {
            // delete bulk using envId
            const vars = await Variable.deleteMany({ enviornmentId: enviornment?._id })
            if (!vars || vars.deletedCount === 0) {
                return res.status(400).json({ message: "Variables not found in this enviornment" })
            }
            return res.status(200).json({ message: `${vars.deletedCount} Variables deleted successfully.` });
        } else {
            // single delete using varId
            const variable = await Variable.findOneAndDelete({
                variableId: variableId,
                enviornmentId: enviornment?._id
            })
            if (!variable) {
                return res.status(400).json({ message: "Variable not found in this enviornment" })
            }
            return res.status(200).json({ message: "Variable deleted successfully." });
        }

    } catch (error) {
        console.error('Variable delete error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while deleting variable'
        });
    }
}

module.exports = {
    createVariables,
    updateVariable,
    deleteVariable
}