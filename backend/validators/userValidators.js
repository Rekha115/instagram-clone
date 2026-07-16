import { query, param } from 'express-validator';

export const searchUsersValidator = [
  query('q').trim().notEmpty().withMessage('Search query is required').isLength({ max: 50 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

export const usernameParamValidator = [
  param('username')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Username is required'),
];

export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];
