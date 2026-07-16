import express from 'express';
import {
  getProfile,
  updateProfile,
  updateProfilePicture,
  searchUsers,
  getSuggestedUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { getSavedPosts } from '../controllers/bookmarkController.js';
import { uploadProfilePicture } from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { updateProfileValidator } from '../validators/authValidators.js';
import {
  searchUsersValidator,
  usernameParamValidator,
  paginationValidator,
} from '../validators/userValidators.js';

const router = express.Router();

// Specific routes before the dynamic "/:username" route so they aren't shadowed
router.get('/search', searchUsersValidator, validate, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);

router.patch('/me', protect, updateProfileValidator, validate, updateProfile);
router.patch('/me/avatar', protect, uploadProfilePicture, updateProfilePicture);
router.get('/me/saved', protect, getSavedPosts);

router.get('/:username', usernameParamValidator, validate, optionalAuth, getProfile);
router.post('/:username/follow', protect, usernameParamValidator, validate, followUser);
router.delete('/:username/follow', protect, usernameParamValidator, validate, unfollowUser);
router.get('/:username/followers', optionalAuth, usernameParamValidator, paginationValidator, validate, getFollowers);
router.get('/:username/following', optionalAuth, usernameParamValidator, paginationValidator, validate, getFollowing);

export default router;
