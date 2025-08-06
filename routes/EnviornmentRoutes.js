const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { createEnviornment, listEnviornments, editEnviornment, deleteEnviornment } = require('../controllers/EnviornmentsController');

const enviornmentRouter = express.Router();

enviornmentRouter.post('/projects/:projectId/create-enviornment', requireAuth, createEnviornment)
enviornmentRouter.post('/projects/:projectId/enviornments', requireAuth, listEnviornments)
enviornmentRouter.put('/projects/enviornments/:enviornmentId', requireAuth, editEnviornment)
enviornmentRouter.delete('/projects/enviornments/:enviornmentId', requireAuth, deleteEnviornment)

module.exports = enviornmentRouter;