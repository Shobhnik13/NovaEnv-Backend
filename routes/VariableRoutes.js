const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { createVariables, listVariables } = require('../controllers/VariableController');

const variableRouter = express.Router();

variableRouter.post('/project/:projectId/create-variable/:enviornmentId', requireAuth, createVariables)
variableRouter.post('/variables/:enviornmentId', listVariables)

module.exports = variableRouter;