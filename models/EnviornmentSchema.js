const { default: mongoose } = require("mongoose");
const { nextId } = require("../utils/idGenerator");

const enviornmentSchema = mongoose.Schema({
    enviornmentId: {
        type: String,
        required: true,
        default: () => nextId()
    },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

enviornmentSchema.index({ projectId: 1, name: 1 }, { unique: true });
enviornmentSchema.index({ projectId: 1, createdAt: -1 });
enviornmentSchema.index({ enviornmentId: 1 });


const Enviornment = mongoose.model('Enviornment', enviornmentSchema);
module.exports = Enviornment;