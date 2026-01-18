import api from "./axios";

// Note API functions

// Create a new note in a project
export const createNote = (projectId, data) =>
api.post(`/notes/${projectId}`, data);

// Get all notes for a project
export const getProjectNotes = (projectId) =>
api.get(`/notes/${projectId}`);

// Get note details
export const getNoteDetails = (projectId, noteId) =>
api.get(`/notes/${projectId}/n/${noteId}`);

// Update note
export const updateNote = (projectId, noteId, data) =>
api.put(`/notes/${projectId}/n/${noteId}`, data);

// Delete note
export const deleteNote = (projectId, noteId) =>
api.delete(`/notes/${projectId}/n/${noteId}`);
