const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { createEnviornment, listEnviornments, editEnviornment, deleteEnviornment } = require('../controllers/EnviornmentsController');

const enviornmentRouter = express.Router();

enviornmentRouter.post('/projects/:projectId/create-enviornment', createEnviornment)
enviornmentRouter.post('/projects/:projectId/enviornments', listEnviornments)
enviornmentRouter.put('/projects/enviornments/:enviornmentId', editEnviornment)
enviornmentRouter.delete('/projects/enviornments/:enviornmentId', deleteEnviornment)

module.exports = enviornmentRouter;