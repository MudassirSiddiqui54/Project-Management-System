import { body } from 'express-validator';

export const projectCreateValidator = () => {
    return [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Project name is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Project name must be 3-100 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description cannot exceed 500 characters')
    ];
};

export const projectUpdateValidator = () => {
    return [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage('Project name must be 3-100 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description cannot exceed 500 characters'),
        body('status')
            .optional()
            .isIn(['active', 'archived', 'completed'])
            .withMessage('Invalid project status')
    ];
};

export const addMemberValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Invalid email format'),
        body('role')
            .optional()
            .isIn(['admin', 'project_admin', 'member'])
            .withMessage('Invalid role')
    ];
};

export const updateRoleValidator = () => {
    return [
        body('role')
            .notEmpty()
            .withMessage('Role is required')
            .isIn(['admin', 'project_admin', 'member'])
            .withMessage('Invalid role')
    ];
};