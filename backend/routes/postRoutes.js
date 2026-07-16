import express from 'express';
import {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getFeed,
  getExplore,
  getReels,
  getUserPosts,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { uploadPostMedia } from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import {
  createPostValidator,
  updatePostValidator,
  postIdParamValidator,
  feedPaginationValidator,
} from '../validators/postValidators.js';
import commentRoutes from './commentRoutes.js';
import { savePost, unsavePost } from '../controllers/bookmarkController.js';

const router = express.Router();

// Nested comment routes: /api/posts/:postId/comments
router.use('/:postId/comments', commentRoutes);

// Static routes before dynamic "/:postId" so they aren't shadowed
router.get('/feed', protect, feedPaginationValidator, validate, getFeed);
router.get('/explore', optionalAuth, feedPaginationValidator, validate, getExplore);
router.get('/reels', optionalAuth, feedPaginationValidator, validate, getReels);
router.get('/user/:username', feedPaginationValidator, validate, getUserPosts);

router.post('/', protect, uploadPostMedia, createPostValidator, validate, createPost);

router.get('/:postId', optionalAuth, postIdParamValidator, validate, getPostById);
router.patch('/:postId', protect, postIdParamValidator, updatePostValidator, validate, updatePost);
router.delete('/:postId', protect, postIdParamValidator, validate, deletePost);

router.post('/:postId/like', protect, postIdParamValidator, validate, likePost);
router.delete('/:postId/like', protect, postIdParamValidator, validate, unlikePost);

router.post('/:postId/save', protect, postIdParamValidator, validate, savePost);
router.delete('/:postId/save', protect, postIdParamValidator, validate, unsavePost);

export default router;
