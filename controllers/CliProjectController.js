const Project = require("../models/ProjectSchema");
const User = require("../models/UserSchema");

const listProjects = async (req, res) => {
    try {
        const apiKey = req.user.apiKey
        const user = await User.findOne({ apiKey })

        const projects = await Project.find({ userId: user?._id })
        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Fetch projects cli error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { listProjects }