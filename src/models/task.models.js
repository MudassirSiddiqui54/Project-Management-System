import mongoose, { Schema } from 'mongoose';
import { AvailableTaskStatus } from '../utils/constants.js';

const taskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Task title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    // Who created the task
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Who the task is assigned to
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: AvailableTaskStatus,
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    dueDate: {
        type: Date
    },
    // File attachments
    attachments: [{
        url: {
            type: String,
            required: true
        },
        localPath: {
            type: String
        },
        fileName: {
            type: String,
            required: true
        },
        fileType: {
            type: String,
            required: true
        },
        fileSize: {
            type: Number // in bytes
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Labels/tags
    labels: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Completion tracking
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for faster queries
taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

// Virtual for subtask count (we'll link subtasks)
taskSchema.virtual('subtasks', {
    ref: 'SubTask',
    localField: '_id',
    foreignField: 'task'
});

// Method to mark task as complete
taskSchema.methods.markComplete = function() {
    this.status = 'done';
    this.completedAt = new Date();
    return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = function(newStatus) {
    if (!AvailableTaskStatus.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
    }
    this.status = newStatus;
    
    if (newStatus === 'done') {
        this.completedAt = new Date();
    }
    
    return this.save();
};

export const Task = mongoose.model('Task', taskSchema);