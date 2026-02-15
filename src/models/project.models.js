import mongoose, { Schema } from 'mongoose';
import { AvailableUserRole } from '../utils/constants.js';

const projectSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Project owner/creator
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Members with their roles in this specific project
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: AvailableUserRole,
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Project status
    status: {
        type: String,
        enum: ['active', 'archived', 'completed'],
        default: 'active'
    },
    // Optional: Project color or icon for UI
    color: {
        type: String,
        default: '#3B82F6' // blue color
    }
}, {
    timestamps: true
});

// Index for faster queries
projectSchema.index({ owner: 1 });

// Add owner as first member when project is created
projectSchema.pre('save', function() {
    if (this.isNew) {
        // Check if owner is already in members (shouldn't be, but just in case)
        const ownerAlreadyMember = this.members.some(
            member => member.user.toString() === this.owner.toString()
        );
        
        if (!ownerAlreadyMember) {
            this.members.push({
                user: this.owner,
                role: 'admin', // Owner is admin by default
                joinedAt: new Date()
            });
        }
    }
});

// Virtual for getting member count
projectSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

// Method to check if a user is a member
projectSchema.methods.isMember = function(userId) {
    return this.members.some(member => {
        const memberUserId = member.user._id ? member.user._id.toString() : member.user.toString();
        return memberUserId === userId.toString();
    });
};
// Method to get user's role in project
projectSchema.methods.getUserRole = function(userId) {
    const member = this.members.find(member => 
        member.user.toString() === userId.toString()
    );
    return member ? member.role : null;
};

export const Project = mongoose.model('Project', projectSchema);