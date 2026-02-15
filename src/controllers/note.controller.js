import { Note } from '../models/note.models.js';
import { Project } from '../models/project.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

// Create a new note
const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, content, tags, isPinned } = req.body;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is admin (only admins can create notes per PRD)
    const userRole = project.getUserRole(userId);
    if (userRole !== 'admin') {
        throw new ApiError(403, "Only project admin can create notes");
    }

    // Create note
    const note = await Note.create({
        title,
        content,
        project: projectId,
        createdBy: userId,
        tags,
        isPinned: isPinned || false
    });

    await note.populate('createdBy', 'username email avatar');

    return res.status(201).json(
        new ApiResponse(201, { note }, "Note created successfully")
    );
});

// Get all notes for a project
const getProjectNotes = asyncHandler(async (req, res) => {
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

    // Get notes (members can view)
    const notes = await Note.find({ project: projectId })
        .populate('createdBy', 'username email avatar')
        .sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, { notes }, "Notes fetched successfully")
    );
});

// Get note details
const getNoteDetails = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Get note
    const note = await Note.findById(noteId)
        .populate('createdBy', 'username email avatar');

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { note }, "Note details fetched successfully")
    );
});

// Update note
const updateNote = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is admin
    const userRole = project.getUserRole(userId);
    if (userRole !== 'admin') {
        throw new ApiError(403, "Only project admin can update notes");
    }

    // Get note
    const note = await Note.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    // Update fields
    const allowedUpdates = ['title', 'content', 'tags', 'isPinned'];
    allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            note[field] = updates[field];
        }
    });

    await note.save();
    await note.populate('createdBy', 'username email avatar');

    return res.status(200).json(
        new ApiResponse(200, { note }, "Note updated successfully")
    );
});

// Delete note
const deleteNote = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;
    const userId = req.user._id;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is admin
    const userRole = project.getUserRole(userId);
    if (userRole !== 'admin') {
        throw new ApiError(403, "Only project admin can delete notes");
    }

    await Note.findByIdAndDelete(noteId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Note deleted successfully")
    );
});

export {
    createNote,
    getProjectNotes,
    getNoteDetails,
    updateNote,
    deleteNote
};