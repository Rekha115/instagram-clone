import { body, query, param } from 'express-validator';

export const createPostValidator = [
  body('caption').optional().trim().isLength({ max: 2200 }).withMessage('Caption cannot exceed 2200 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('postType').optional().isIn(['post', 'reel']).withMessage('Invalid post type'),
];

export const updatePostValidator = [
  body('caption').optional().trim().isLength({ max: 2200 }).withMessage('Caption cannot exceed 2200 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
];

export const postIdParamValidator = [param('postId').isMongoId().withMessage('Invalid post id')];

export const feedPaginationValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];
