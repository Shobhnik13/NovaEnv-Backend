const express = require('express');
const requireApiKey = require('../middleware/apiKeyMiddleware');
const { listVariables } = require('../controllers/CliVariableController');

const cliVariableRouter = express.Router();

cliVariableRouter.post('/project/:projectId/enviornments/:enviornmentId/variables', requireApiKey, listVariables)

module.exports = cliVariableRouter;