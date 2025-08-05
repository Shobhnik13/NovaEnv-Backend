const getOrCreateUser = require("../utils/GetOrCreateUser");

const registerUser = async (req, res) => {
    try {
        const { userId: clerkId } = req.auth;
        const { emailAddress } = req.auth.sessionClaims;

        // Validation
        if (!clerkId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!emailAddress) {
            return res.status(400).json({ error: 'Email address is required' });
        }

        const user = await getOrCreateUser(clerkId, emailAddress);

        res.status(200).json({
            id: user._id,
            email: user.email,
            apiKey: user.apiKey,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Register user error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'An error occurred while registering the user'
        });
    }
};

module.exports = registerUser;