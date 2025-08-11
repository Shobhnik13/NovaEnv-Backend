const { default: mongoose } = require("mongoose");
const { nextId } = require("../utils/idGenerator");

const variableSchema = new mongoose.Schema({
  variableId: {
    type: String,
    required: true,
    default: () => nextId()
  },
  key: { type: String, required: true },
  value: { type: String, required: true }, // Encrypted value
  description: { type: String, default: '' },
  enviornmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Environment', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // For faster queries
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

variableSchema.index({ enviornmentId: 1 });              // Find variables in an environment
variableSchema.index({ projectId: 1 });                  // Find variables in a project
variableSchema.index({ enviornmentId: 1, createdAt: -1 });// Sort variables by creation date
variableSchema.index({ variableId: 1 });                  // Lookup by custom variableId

const Variable = mongoose.model('Variable', variableSchema)
module.exports = Variable