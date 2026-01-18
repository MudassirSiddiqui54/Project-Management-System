import api from "./axios";

// Subtask API functions

// Create a new subtask for a task
export const createSubTask = (projectId, taskId, data) =>
api.post(`/subtasks/${projectId}/t/${taskId}`, data);

// Get all subtasks for a task
export const getTaskSubTasks = (projectId, taskId) =>
api.get(`/subtasks/${projectId}/t/${taskId}`);

// Update subtask
export const updateSubTask = (projectId, subTaskId, data) =>
api.put(`/subtasks/${projectId}/st/${subTaskId}`, data);

// Delete subtask
export const deleteSubTask = (projectId, subTaskId) =>
api.delete(`/subtasks/${projectId}/st/${subTaskId}`);

// Update subtask status
export const updateSubTaskStatus = (projectId, subTaskId, status) =>
api.patch(`/subtasks/${projectId}/st/${subTaskId}/status`, { status });
