const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { createVariables, listVariables } = require('../controllers/VariableController');

const variableRouter = express.Router();

variableRouter.post('/create-variable/:enviornmentId', createVariables)
variableRouter.post('/variables/:enviornmentId', listVariables)

module.exports = variableRouter;