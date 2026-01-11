import { SubTask } from '../models/subtask.models.js';
import { Task } from '../models/task.models.js';
import { Project } from '../models/project.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

// Create a new subtask
const createSubTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { title, description, assignedTo } = req.body;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Create subtask
    const subTask = await SubTask.create({
        title,
        description,
        task: taskId,
        project: projectId,
        createdBy: userId,
        assignedTo
    });

    await subTask.populate('assignedTo', 'username email avatar');

    return res.status(201).json(
        new ApiResponse(201, { subTask }, "Subtask created successfully")
    );
});

// Get all subtasks for a task
const getTaskSubTasks = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Get subtasks
    const subTasks = await SubTask.find({ task: taskId })
        .populate('assignedTo', 'username email avatar')
        .sort({ position: 1 });

    return res.status(200).json(
        new ApiResponse(200, { subTasks }, "Subtasks fetched successfully")
    );
});

// Update subtask
const updateSubTask = asyncHandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Get subtask
    const subTask = await SubTask.findById(subTaskId);
    if (!subTask) {
        throw new ApiError(404, "Subtask not found");
    }

    // Update fields
    const allowedUpdates = ['title', 'description', 'assignedTo', 'status', 'position'];
    allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            subTask[field] = updates[field];
        }
    });

    // Handle status change
    if (updates.status === 'done') {
        subTask.completedAt = new Date();
    } else if (updates.status && updates.status !== 'done') {
        subTask.completedAt = null;
    }

    await subTask.save();
    await subTask.populate('assignedTo', 'username email avatar');

    return res.status(200).json(
        new ApiResponse(200, { subTask }, "Subtask updated successfully")
    );
});

// Delete subtask
const deleteSubTask = asyncHandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Check user role for deletion permission
    const userRole = project.getUserRole(userId);
    if (!['admin', 'project_admin'].includes(userRole)) {
        throw new ApiError(403, "You don't have permission to delete subtasks");
    }

    await SubTask.findByIdAndDelete(subTaskId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Subtask deleted successfully")
    );
});

// Update subtask status (for any member)
const updateSubTaskStatus = asyncHandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    const subTask = await SubTask.findById(subTaskId);
    if (!subTask) {
        throw new ApiError(404, "Subtask not found");
    }

    // Update status
    subTask.status = status;
    if (status === 'done') {
        subTask.completedAt = new Date();
    } else {
        subTask.completedAt = null;
    }

    await subTask.save();

    return res.status(200).json(
        new ApiResponse(200, { subTask }, "Subtask status updated successfully")
    );
});

export {
    createSubTask,
    getTaskSubTasks,
    updateSubTask,
    deleteSubTask,
    updateSubTaskStatus
};