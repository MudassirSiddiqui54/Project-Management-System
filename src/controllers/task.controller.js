import { Task } from '../models/task.models.js';
import { Project } from '../models/project.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

// Create a new task
const createTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority, dueDate, labels } = req.body;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Create task
    const task = await Task.create({
        title,
        description,
        project: projectId,
        createdBy: userId,
        assignedTo,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        labels
    });

    await task.populate('createdBy', 'username email avatar');
    await task.populate('assignedTo', 'username email avatar');

    return res.status(201).json(
        new ApiResponse(201, { task }, "Task created successfully")
    );
});

// Get all tasks for a project
const getProjectTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Get tasks with filtering options
    const { status, assignedTo, search } = req.query;
    const filter = { project: projectId };

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const tasks = await Task.find(filter)
        .populate('createdBy', 'username email avatar')
        .populate('assignedTo', 'username email avatar')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, { tasks }, "Tasks fetched successfully")
    );
});

// Get task details
const getTaskDetails = asyncHandler(async (req, res) => {
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

    // Get task with subtasks
    const task = await Task.findById(taskId)
        .populate('createdBy', 'username email avatar')
        .populate('assignedTo', 'username email avatar')
        .populate({
            path: 'subtasks',
            populate: {
                path: 'assignedTo',
                select: 'username email avatar'
            }
        });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { task }, "Task details fetched successfully")
    );
});

// Update task
const updateTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
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

    // Get task
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Update fields
    const allowedUpdates = ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'labels'];
    allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            task[field] = updates[field];
        }
    });

    // Handle status change
    if (updates.status === 'done') {
        task.completedAt = new Date();
    } else if (updates.status && updates.status !== 'done') {
        task.completedAt = null;
    }

    await task.save();
    await task.populate('assignedTo', 'username email avatar');

    return res.status(200).json(
        new ApiResponse(200, { task }, "Task updated successfully")
    );
});

// Delete task
const deleteTask = asyncHandler(async (req, res) => {
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

    // Check user role for deletion permission
    const userRole = project.getUserRole(userId);
    if (!['admin', 'project_admin'].includes(userRole)) {
        throw new ApiError(403, "You don't have permission to delete tasks");
    }

    await Task.findByIdAndDelete(taskId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Task deleted successfully")
    );
});

// Update task status (simplified for members)
const updateTaskStatus = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
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

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Update status
    task.status = status;
    if (status === 'done') {
        task.completedAt = new Date();
    } else {
        task.completedAt = null;
    }

    await task.save();

    return res.status(200).json(
        new ApiResponse(200, { task }, "Task status updated successfully")
    );
});

export {
    createTask,
    getProjectTasks,
    getTaskDetails,
    updateTask,
    deleteTask,
    updateTaskStatus
};