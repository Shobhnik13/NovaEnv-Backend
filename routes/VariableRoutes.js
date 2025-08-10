const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { createVariables, listVariables, updateVariable, deleteVariable } = require('../controllers/VariableController');

const variableRouter = express.Router();

variableRouter.post('/project/:projectId/create-variable/:enviornmentId', requireAuth, createVariables)
variableRouter.put('/projects/:enviornmentId/variable/:variableId', requireAuth,updateVariable)
variableRouter.delete('/projects/:enviornmentId/variable/:variableId', requireAuth, deleteVariable)
module.exports = variableRouter;