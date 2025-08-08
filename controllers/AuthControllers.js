const User = require("../models/UserSchema");
const generateApiKey = require("../utils/GenerateApiKey");
const getOrCreateUser = require("../utils/GetOrCreateUser");

const registerUser = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth;
        const { email } = req.body;

        // Validation
        if (!clerkId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Email address is required' });
        }

        const user = await getOrCreateUser(clerkId, email);

        res.status(200).json('synced');
    } catch (error) {
        console.error('Register user error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while registering the user'
        });
    }
};


const regenerateApiKey = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth
        const user = await User.findOne({ clerkId })
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.apiKey = generateApiKey()
        await user.save();
        res.status(200).json({
            message: 'API key regenerated successfully',
            apiKey: user.apiKey
        });
    } catch (error) {
        console.error('Regenerate API key error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while regenerating the API key'
        });
    }
}

module.exports = { registerUser, regenerateApiKey };