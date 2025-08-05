const { default: mongoose } = require("mongoose");

const variableSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }, // Encrypted value
  description: { type: String, default: '' },
  environmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Environment', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // For faster queries
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

variableSchema.index({ environmentId: 1, key: 1 }, { unique: true });
variableSchema.index({ projectId: 1 });
variableSchema.index({ environmentId: 1, createdAt: -1 });

const Variable = mongoose.model('Variable', variableSchema)
module.exports = Variable