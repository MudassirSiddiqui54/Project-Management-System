import mongoose, { Schema } from 'mongoose';

const invitationSchema = new Schema({
    project: { 
        type: Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        lowercase: true,
        trim: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'project_admin', 'member'],
        default: 'member' 
    },
    token: { 
        type: String, 
        required: true,
        unique: true 
    },
    invitedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'expired'], 
        default: 'pending' 
    },
    expiresAt: { 
        type: Date, 
        required: true 
    }
}, { 
    timestamps: true 
});

// Indexes for faster queries
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1 });
invitationSchema.index({ project: 1 });
invitationSchema.index({ status: 1 });
invitationSchema.index({ expiresAt: 1 });

// Add pre-save hook to check expiration
invitationSchema.pre('save', function(next) {
    if (this.expiresAt < new Date() && this.status === 'pending') {
        this.status = 'expired';
    }
});

// Create and export the model
export const Invitation = mongoose.model('Invitation', invitationSchema);