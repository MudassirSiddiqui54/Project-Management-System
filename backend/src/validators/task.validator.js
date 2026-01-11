import { body } from 'express-validator';

export const taskCreateValidator = () => {
    return [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Task title is required')
            .isLength({ min: 3, max: 200 })
            .withMessage('Task title must be 3-200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Description cannot exceed 2000 characters'),
        body('priority')
            .optional()
            .isIn(['low', 'medium', 'high', 'critical'])
            .withMessage('Invalid priority level'),
        body('dueDate')
            .optional()
            .isISO8601()
            .withMessage('Invalid date format'),
        body('labels')
            .optional()
            .isArray()
            .withMessage('Labels must be an array')
    ];
};

export const taskUpdateValidator = () => {
    return [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage('Task title must be 3-200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Description cannot exceed 2000 characters'),
        body('status')
            .optional()
            .isIn(['todo', 'in_progress', 'done'])
            .withMessage('Invalid status'),
        body('priority')
            .optional()
            .isIn(['low', 'medium', 'high', 'critical'])
            .withMessage('Invalid priority level'),
        body('dueDate')
            .optional()
            .isISO8601()
            .withMessage('Invalid date format'),
        body('labels')
            .optional()
            .isArray()
            .withMessage('Labels must be an array')
    ];
};