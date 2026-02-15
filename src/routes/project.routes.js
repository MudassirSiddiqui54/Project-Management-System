import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
    createProject,
    getUserProjects,
    getProjectDetails,
    updateProject,
    deleteProject,
    getProjectStats,
    addProjectMember,
    removeProjectMember,
    updateMemberRole,
    acceptInvitation
} from '../controllers/project.controller.js';
import {
    projectCreateValidator,
    projectUpdateValidator,
    addMemberValidator,
    updateRoleValidator
} from '../validators/project.validator.js';

const router = Router();
// Accept/Reject invitations
router.route('/:projectId/invitations/accept/:invitationToken')
    .post(acceptInvitation);

// All project routes require authentication except for accepting invitations
router.use(verifyJWT);

// GET /api/v1/projects - List user projects
router.route('/')
    .get(getUserProjects);

// POST /api/v1/projects - Create project
router.route('/')
    .post(projectCreateValidator(), validate, createProject);

// GET /api/v1/projects/:projectId - Get project details
// PUT /api/v1/projects/:projectId - Update project
// DELETE /api/v1/projects/:projectId - Delete project
router.route('/:projectId')
    .get(getProjectDetails)
    .put(projectUpdateValidator(), validate, updateProject)
    .delete(deleteProject);

// POST /api/v1/projects/:projectId/members - Add project member
router.route('/:projectId/members')
    .post(addMemberValidator(), validate, addProjectMember);

// Update member role or DELETE member (PUT used to update existing)
router.route('/:projectId/members/:userId')
    .put(updateRoleValidator(), validate, updateMemberRole)    // UPDATE role
    .delete(removeProjectMember); // DELETE member

router.route('/:projectId/stats')
    .get(getProjectStats);

export default router;