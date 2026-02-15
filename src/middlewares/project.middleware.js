import { Project } from '../models/project.models.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

// Check if user is member of project
export const isProjectMember = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const isMember = project.members.some(
        member => member.user.toString() === userId.toString()
    );

    if (!isMember) {
        throw new ApiError(403, "You are not a member of this project");
    }

    req.project = project;
    next();
});

// Check specific role in project
export const checkProjectRole = (requiredRole) => {
    return asyncHandler(async (req, res, next) => {
        const project = req.project || await Project.findById(req.params.projectId);
        
        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        const userMember = project.members.find(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!userMember) {
            throw new ApiError(403, "You are not a member of this project");
        }

        // Role hierarchy: admin > project_admin > member
        const roleHierarchy = {
            member: 1,
            project_admin: 2,
            admin: 3
        };

        if (roleHierarchy[userMember.role] < roleHierarchy[requiredRole]) {
            throw new ApiError(403, `Required role: ${requiredRole}, you are: ${userMember.role}`);
        }

        req.userRole = userMember.role;
        next();
    });
};

// Simplified: Check if user can create (admin/project_admin)
export const canCreateContent = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const userMember = project.members.find(
        member => member.user.toString() === userId.toString()
    );

    if (!userMember) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Only admin and project_admin can create tasks
    if (!['admin', 'project_admin'].includes(userMember.role)) {
        throw new ApiError(403, "Only admin or project admin can create content");
    }

    req.userRole = userMember.role;
    req.project = project;
    next();
});

// Check if user can delete (admin only)
export const canDeleteContent = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const userMember = project.members.find(
        member => member.user.toString() === userId.toString()
    );

    if (!userMember) {
        throw new ApiError(403, "You are not a member of this project");
    }

    // Only admin can delete
    if (userMember.role !== 'admin') {
        throw new ApiError(403, "Only admin can delete content");
    }

    next();
});