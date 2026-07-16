import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { addCommentValidator, commentParamsValidator } from '../validators/commentValidators.js';
import { postIdParamValidator } from '../validators/postValidators.js';

// mergeParams so :postId from the parent router is accessible here
const router = express.Router({ mergeParams: true });

router.get('/', postIdParamValidator, validate, getComments);
router.post('/', protect, addCommentValidator, validate, addComment);
router.delete('/:commentId', protect, commentParamsValidator, validate, deleteComment);

export default router;
