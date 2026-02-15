import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
    createNote,
    getProjectNotes,
    getNoteDetails,
    updateNote,
    deleteNote
} from '../controllers/note.controller.js';
import {
    noteCreateValidator,
    noteUpdateValidator
} from '../validators/note.validator.js';

const router = Router();

// All note routes require authentication
router.use(verifyJWT);

// GET /api/v1/notes/:projectId - List project notes
// POST /api/v1/notes/:projectId - Create note
router.route('/:projectId/notes')
    .get(getProjectNotes)
    .post(noteCreateValidator(), validate, createNote);

// GET /api/v1/notes/:projectId/n/:noteId - Get note details
// PUT /api/v1/notes/:projectId/n/:noteId - Update note
// DELETE /api/v1/notes/:projectId/n/:noteId - Delete note
router.route('/:projectId/notes/:noteId')
    .get(getNoteDetails)
    .put(noteUpdateValidator(), validate, updateNote)
    .delete(deleteNote);

export default router;