import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
    createSubTask,
    getTaskSubTasks,
    updateSubTask,
    deleteSubTask,
    updateSubTaskStatus
} from '../controllers/subtask.controller.js';
import {
    subtaskCreateValidator,
    subtaskUpdateValidator
} from '../validators/subtask.validator.js';

const router = Router();

// All subtask routes require authentication
router.use(verifyJWT);

// POST /api/v1/subtasks/:projectId/t/:taskId - Create subtask
router.route('/:projectId/tasks/:taskId/subtasks')
    .post(subtaskCreateValidator(), validate, createSubTask);

// GET /api/v1/subtasks/:projectId/t/:taskId - Get task subtasks
router.route('/:projectId/tasks/:taskId/subtasks')
    .get(getTaskSubTasks);

// PUT /api/v1/subtasks/:projectId/st/:subTaskId - Update subtask
// DELETE /api/v1/subtasks/:projectId/st/:subTaskId - Delete subtask
router.route('/:projectId/subtasks/:subTaskId')
    .put(subtaskUpdateValidator(), validate, updateSubTask)
    .delete(deleteSubTask);

// PATCH /api/v1/subtasks/:projectId/st/:subTaskId/status - Update subtask status
router.route('/:projectId/subtasks/:subTaskId/status')
    .patch(updateSubTaskStatus);

export default router;