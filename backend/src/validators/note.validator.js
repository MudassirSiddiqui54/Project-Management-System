import { body } from 'express-validator';

export const noteCreateValidator = () => {
    return [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Note title is required')
            .isLength({ min: 3, max: 200 })
            .withMessage('Note title must be 3-200 characters'),
        body('content')
            .trim()
            .notEmpty()
            .withMessage('Note content is required'),
        body('tags')
            .optional()
            .isArray()
            .withMessage('Tags must be an array'),
        body('isPinned')
            .optional()
            .isBoolean()
            .withMessage('isPinned must be true or false')
    ];
};

export const noteUpdateValidator = () => {
    return [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage('Note title must be 3-200 characters'),
        body('content')
            .optional()
            .trim(),
        body('tags')
            .optional()
            .isArray()
            .withMessage('Tags must be an array'),
        body('isPinned')
            .optional()
            .isBoolean()
            .withMessage('isPinned must be true or false')
    ];
};