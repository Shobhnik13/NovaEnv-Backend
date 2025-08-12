const express = require('express');
const requireApiKey = require('../middleware/apiKeyMiddleware');
const { login } = require('../controllers/CliAuthController');

const cliAuthRouter = express.Router();

cliAuthRouter.post('/login', requireApiKey, login)

module.exports = cliAuthRouter;