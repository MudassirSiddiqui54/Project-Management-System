import mongoose, { Schema } from 'mongoose';

const noteSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Note title is required'],
        trim: true,
        maxlength: [200, 'Note title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Note content is required'],
        trim: true
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
    // Tags for organization
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Can pin important notes
    isPinned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
noteSchema.index({ project: 1 });
noteSchema.index({ createdBy: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ isPinned: 1 });

export const Note = mongoose.model('Note', noteSchema);