const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { listProjects, createProject } = require('../controllers/ProjectController');

const projectRouter = express.Router();

projectRouter.post('/projects', requireAuth, listProjects)
projectRouter.post('/create-project', requireAuth, createProject)


module.exports = projectRouter;