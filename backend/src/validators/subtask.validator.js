import { body } from 'express-validator';

export const subtaskCreateValidator = () => {
    return [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Subtask title is required')
            .isLength({ min: 3, max: 200 })
            .withMessage('Subtask title must be 3-200 characters'),
        body('description')
            .optional()
            .trim()
    ];
};

export const subtaskUpdateValidator = () => {
    return [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage('Subtask title must be 3-200 characters'),
        body('description')
            .optional()
            .trim(),
        body('status')
            .optional()
            .isIn(['todo', 'in_progress', 'done'])
            .withMessage('Invalid status')
    ];
};