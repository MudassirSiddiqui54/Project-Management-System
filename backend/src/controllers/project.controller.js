import { Project } from '../models/project.models.js';
import { User } from '../models/user.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import {sendEmail} from "../utils/mail.js";
import {Invitation} from "../models/invitation.models.js"
import crypto from "crypto";

// Create a new project
const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;

    const project = await Project.create({
        name,
        description,
        owner: userId
    });

    // Populate owner details
    await project.populate('owner', 'username email');

    return res.status(201).json(
        new ApiResponse(201, { project }, "Project created successfully")
    );
});

// Get all projects for the current user
const getUserProjects = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const projects = await Project.find({
        'members.user': userId
    })
    .populate('owner', 'username email avatar')
    .populate('members.user', 'username email avatar')
    .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, { projects }, "Projects fetched successfully")
    );
});

// Get project details by ID
const getProjectDetails = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId)
        .populate('owner', 'username email avatar')
        .populate('members.user', 'username email avatar');

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is a member
    if (!project.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    return res.status(200).json(
        new ApiResponse(200, { project }, "Project details fetched successfully")
    );
});

// Update project
const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is admin
    const userRole = project.getUserRole(userId);
    if (userRole !== 'admin') {
        throw new ApiError(403, "Only project admin can update project");
    }

    // Update fields
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;

    await project.save();
    await project.populate('owner', 'username email avatar');
    await project.populate('members.user', 'username email avatar');

    return res.status(200).json(
        new ApiResponse(200, { project }, "Project updated successfully")
    );
});

// Delete project
const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is admin
    const userRole = project.getUserRole(userId);
    if (userRole !== 'admin') {
        throw new ApiError(403, "Only project admin can delete project");
    }

    await Project.findByIdAndDelete(projectId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Project deleted successfully")
    );
});

// Add member to project
const addProjectMember = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { email, role = 'member' } = req.body;
    const currentUserId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    // Check if current user is project admin
    const currentUserRole = project.getUserRole(currentUserId);
    if (currentUserRole !== 'admin') {
        throw new ApiError(403, "Only project admin can add members");
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    
    // Check if already a member (if user exists)
    if (userToAdd && project.isMember(userToAdd._id)) {
        throw new ApiError(400, "User is already a member of this project");
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
        project: projectId,
        email: email.toLowerCase(),
        status: 'pending',
        expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
        throw new ApiError(400, "An invitation is already pending for this user");
    }

    // Create invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    
    // Create invitation (expires in 7 days)
    const invitation = await Invitation.create({
        project: projectId,
        email: email.toLowerCase(),
        role: role,
        token: crypto.createHash('sha256').update(invitationToken).digest('hex'),
        invitedBy: currentUserId,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Send invitation email
    const invitationUrl = `${process.env.CLIENT_URL}/api/v1/projects/${projectId}/invitations/accept/${invitationToken}`;
    
    await sendEmail({
        email: email,
        subject: `Invitation to join project: ${project.name}`,
        mailGenContent: {
            body: {
                name: email,
                intro: `You've been invited by ${req.user.username} to join the project "${project.name}" as a ${role}.`,
                action: {
                    instructions: "To accept this invitation, please click the button below:",
                    button: {
                        color: "#22BC66",
                        text: "Accept Invitation",
                        link: invitationUrl
                    }
                },
                outro: userToAdd 
                    ? "If you didn't expect this invitation, you can safely ignore this email."
                    : "You'll need to register first if you don't have an account."
            }
        }
    });

    return res.status(200).json(
        new ApiResponse(200, { 
            message: "Invitation sent successfully",
            email: email,
            status: "pending",
            expiresAt: invitation.expiresAt,
            note: userToAdd ? "Existing user - can accept immediately" : "New user - needs to register first"
        }, "Invitation email has been sent to the user")
    );
});

// Remove member from project
const removeProjectMember = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;
    const currentUserId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if current user is admin
    const currentUserRole = project.getUserRole(currentUserId);
    if (currentUserRole !== 'admin') {
        throw new ApiError(403, "Only project admin can remove members");
    }

    // Cannot remove owner
    if (project.owner.toString() === userId) {
        throw new ApiError(400, "Cannot remove project owner");
    }

    // Check if user is a member
    if (!project.isMember(userId)) {
        throw new ApiError(404, "User is not a member of this project");
    }

    // Remove user from members
    project.members = project.members.filter(
        member => member.user.toString() !== userId
    );

    await project.save();

    return res.status(200).json(
        new ApiResponse(200, { project }, "Member removed successfully")
    );
});

const acceptInvitation = asyncHandler(async (req, res) => {
    const { projectId, invitationToken } = req.params;
    
    // No userId from JWT - we need to get user from invitation email
    const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');
    
    const invitation = await Invitation.findOne({
        project: projectId,
        token: hashedToken,
        status: 'pending',
        expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
        throw new ApiError(400, "Invitation is invalid, expired, or already used");
    }

    // Find user by email from invitation
    const user = await User.findOne({ email: invitation.email });
    
    if (!user) {
        // User doesn't exist yet - redirect to registration
        return res.status(200).json(
            new ApiResponse(200, { 
                action: 'register',
                email: invitation.email,
                projectId,
                invitationToken
            }, "Please register first to accept this invitation")
        );
    }

    // Add user to project
    const project = await Project.findById(projectId);
    project.members.push({
        user: user._id,
        role: invitation.role,
        joinedAt: new Date()
    });

    invitation.status = 'accepted';
    invitation.user = user._id;

    await Promise.all([project.save(), invitation.save()]);
    
    // Send welcome email
    await sendEmail({
        email: user.email,
        subject: `Welcome to project: ${project.name}`,
        mailGenContent: {
            body: {
                name: user.username,
                intro: `You have successfully joined the project "${project.name}" as a ${invitation.role}.`,
                action: {
                    instructions: "You can now access the project:",
                    button: {
                        color: "#22BC66",
                        text: "Go to Project",
                        link: `${req.protocol}://${req.get("host")}/projects/${projectId}`
                    }
                }
            }
        }
    });

    return res.status(200).json(
        new ApiResponse(200, { 
            projectId,
            role: invitation.role,
            action: 'joined'
        }, "Invitation accepted successfully")
    );
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if current user is project admin
    const currentUserRole = project.getUserRole(currentUserId);
    if (currentUserRole !== 'admin') {
        throw new ApiError(403, "Only project admin can update member roles");
    }

    // Find the member to update
    const memberToUpdate = project.members.find(
        member => member.user && member.user.toString() === userId
    );

    if (!memberToUpdate) {
        throw new ApiError(404, "Member not found in this project");
    }

    // Cannot change owner's role
    if (project.owner.toString() === userId) {
        throw new ApiError(400, "Cannot change project owner's role");
    }

    // Update role
    const oldRole = memberToUpdate.role;
    memberToUpdate.role = role;

    await project.save();
    
    // Notify the member about role change
    const memberUser = await User.findById(userId);
    if (memberUser) {
        await sendEmail({
            email: memberUser.email,
            subject: `Your role has been updated in project: ${project.name}`,
            mailGenContent: {
                body: {
                    name: memberUser.username,
                    intro: `Your role in project "${project.name}" has been changed from ${oldRole} to ${role}.`,
                    action: {
                        instructions: "View the project:",
                        button: {
                            color: "#22BC66",
                            text: "Go to Project",
                            link: `${req.protocol}://${req.get("host")}/projects/${projectId}`
                        }
                    }
                }
            }
        });
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            { 
                userId,
                oldRole,
                newRole: role
            }, 
            "Member role updated successfully"
        )
    );
});


export {
    createProject,
    getUserProjects,
    getProjectDetails,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    acceptInvitation,
    updateMemberRole
};