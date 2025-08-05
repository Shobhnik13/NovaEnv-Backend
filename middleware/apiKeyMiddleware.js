const User = require("../models/UserSchema");

const requireApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }
        const user = await User.findOne({ apiKey })
        if (!user) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        req.user = user
        next()
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.error('API Key middleware error:', error);
    }
}

module.exports = requireApiKey;