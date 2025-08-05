const { default: mongoose } = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema)
module.exports = Project;
