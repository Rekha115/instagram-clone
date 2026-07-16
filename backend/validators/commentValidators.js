import { body, param } from 'express-validator';

export const addCommentValidator = [
  param('postId').isMongoId().withMessage('Invalid post id'),
  body('text').trim().notEmpty().withMessage('Comment cannot be empty').isLength({ max: 500 }),
  body('parentComment').optional({ nullable: true }).isMongoId().withMessage('Invalid parent comment id'),
];

export const commentParamsValidator = [
  param('postId').isMongoId().withMessage('Invalid post id'),
  param('commentId').isMongoId().withMessage('Invalid comment id'),
];
