const express = require('express');
const requireApiKey = require('../middleware/apiKeyMiddleware');
const { login } = require('../controllers/CliAuthController');
const { listProjectById } = require('../controllers/CliEnviornmentController');

const cliEnviornmentRouter = express.Router();

cliEnviornmentRouter.post('/project/:projectId/enviornments', requireApiKey, listProjectById)

module.exports = cliEnviornmentRouter;