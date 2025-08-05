const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const registerUser = require('../controllers/AuthControllers');

const authRouter = express.Router();

authRouter.post('/me', requireAuth, registerUser)

module.exports = authRouter;