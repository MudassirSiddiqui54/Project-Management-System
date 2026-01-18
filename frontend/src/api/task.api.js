import api from "./axios";

// Task API functions

// Create a new task in a project
export const createTask = (projectId, data) =>
api.post(`/tasks/${projectId}`, data);

// Get all tasks for a project
export const getProjectTasks = (projectId, params = {}) =>
api.get(`/tasks/${projectId}`, { params });

// Get task details
export const getTaskDetails = (projectId, taskId) =>
api.get(`/tasks/${projectId}/t/${taskId}`);

// Update task
export const updateTask = (projectId, taskId, data) =>
api.put(`/tasks/${projectId}/t/${taskId}`, data);

// Delete task
export const deleteTask = (projectId, taskId) =>
api.delete(`/tasks/${projectId}/t/${taskId}`);

// Update task status
export const updateTaskStatus = (projectId, taskId, status) =>
api.patch(`/tasks/${projectId}/t/${taskId}/status`, { status });
