const login = async (req, res) => {
    res.json({
        success: true,
        data: {
            clerkId: req.user.clerkId,
            email: req.user.email,
            apikey: req.user.apiKey
        }
    });
}

module.exports = { login }