const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { listProjects, createProject, listProjectById, editProject, deleteProject } = require('../controllers/ProjectController');

const projectRouter = express.Router();

projectRouter.post('/create-project', requireAuth, createProject)
projectRouter.post('/projects', requireAuth, listProjects)
projectRouter.post('/projects/:projectId', requireAuth, listProjectById)
projectRouter.put('/projects/:projectId', requireAuth, editProject)
projectRouter.delete('/projects/projectId', requireAuth, deleteProject)

module.exports = projectRouter;