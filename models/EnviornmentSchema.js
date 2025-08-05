const { default: mongoose } = require("mongoose");

const enviornmentSchema = mongoose.Schema({
    name: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    variables: [{
        key: { type: String, required: true },
        value: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
})

const Enviornment = mongoose.model('Enviornment', enviornmentSchema);
module.exports = Enviornment;