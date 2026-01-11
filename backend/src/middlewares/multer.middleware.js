import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/api-error.js';

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new ApiError(400, 'File type not allowed'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Middleware for single file upload
export const uploadSingle = (fieldName) => {
    return upload.single(fieldName);
};

// Middleware for multiple files
export const uploadMultiple = (fieldName, maxCount = 5) => {
    return upload.array(fieldName, maxCount);
};

// Middleware for task attachments
export const uploadTaskAttachments = uploadMultiple('attachments', 5);