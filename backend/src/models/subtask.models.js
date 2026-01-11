import mongoose, { Schema } from 'mongoose';
import { AvailableTaskStatus } from '../utils/constants.js';

const subTaskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Subtask title is required'],
        trim: true,
        maxlength: [200, 'Subtask title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: AvailableTaskStatus,
        default: 'todo'
    },
    completedAt: {
        type: Date
    },
    // Subtask position/order within task
    position: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for faster queries
subTaskSchema.index({ task: 1 });
subTaskSchema.index({ project: 1 });
subTaskSchema.index({ assignedTo: 1 });
subTaskSchema.index({ status: 1 });

// Before saving, ensure we have a position if not set
subTaskSchema.pre('save', async function(next) {
    if (this.isNew && this.position === 0) {
        // Find the highest position in this task and add 1
        const lastSubTask = await SubTask.findOne({ task: this.task })
            .sort('-position')
            .select('position');
        
        this.position = lastSubTask ? lastSubTask.position + 1 : 1;
    }
});

// Method to mark subtask as complete
subTaskSchema.methods.markComplete = function() {
    this.status = 'done';
    this.completedAt = new Date();
    return this.save();
};

export const SubTask = mongoose.model('SubTask', subTaskSchema);