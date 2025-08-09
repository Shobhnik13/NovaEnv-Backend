const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { createEnviornment, listEnviornments, editEnviornment, deleteEnviornment, listEnviornmentById } = require('../controllers/EnviornmentsController');

const enviornmentRouter = express.Router();

enviornmentRouter.post('/projects/:projectId/create-enviornment', requireAuth, createEnviornment)
enviornmentRouter.post('/projects/:projectId/enviornments', requireAuth, listEnviornments)
enviornmentRouter.put('/projects/enviornments/:enviornmentId', requireAuth, editEnviornment)
enviornmentRouter.delete('/projects/enviornments/:enviornmentId', requireAuth, deleteEnviornment)
enviornmentRouter.post('/projects/:projectId/variables/:enviornmentId', requireAuth, listEnviornmentById)
module.exports = enviornmentRouter;