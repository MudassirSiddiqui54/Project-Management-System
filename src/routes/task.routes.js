import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
    createTask,
    getProjectTasks,
    getTaskDetails,
    updateTask,
    deleteTask,
    updateTaskStatus
} from '../controllers/task.controller.js';
import {
    taskCreateValidator,
    taskUpdateValidator
} from '../validators/task.validator.js';

const router = Router();

// All task routes require authentication
router.use(verifyJWT);

// GET /api/v1/tasks/:projectId - List project tasks
// POST /api/v1/tasks/:projectId - Create task
router.route('/:projectId/tasks')
    .get(getProjectTasks)
    .post(taskCreateValidator(), validate, createTask);

// GET /api/v1/tasks/:projectId/t/:taskId - Get task details
// PUT /api/v1/tasks/:projectId/t/:taskId - Update task
// DELETE /api/v1/tasks/:projectId/t/:taskId - Delete task
router.route('/:projectId/tasks/:taskId')
    .get(getTaskDetails)
    .put(taskUpdateValidator(), validate, updateTask)
    .delete(deleteTask);

// PATCH /api/v1/tasks/:projectId/t/:taskId/status - Update task status
router.route('/:projectId/tasks/:taskId/status')
    .patch(updateTaskStatus);

export default router;