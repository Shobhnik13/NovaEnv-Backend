const express = require('express');
const requireApiKey = require('../middleware/apiKeyMiddleware');
const { listProjects } = require('../controllers/CliProjectController');

const cliProjectRouter = express.Router();

cliProjectRouter.post('/projects', requireApiKey, listProjects)

module.exports = cliProjectRouter;