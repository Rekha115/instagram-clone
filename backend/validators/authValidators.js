import { body } from 'express-validator';

export const registerValidator = [
  body('username')
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9._]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, dots, and underscores'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 50 })
    .withMessage('Full name cannot exceed 50 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

export const loginValidator = [
  body('identifier').trim().notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('username')
    .optional()
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9._]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, dots, and underscores'),
  body('fullName').optional().trim().isLength({ max: 50 }).withMessage('Full name cannot exceed 50 characters'),
  body('bio').optional().trim().isLength({ max: 150 }).withMessage('Bio cannot exceed 150 characters'),
  body('website').optional().trim().isLength({ max: 100 }).withMessage('Website URL cannot exceed 100 characters'),
  body('gender').optional().isIn(['male', 'female', 'prefer-not-to-say', '']).withMessage('Invalid gender value'),
];
