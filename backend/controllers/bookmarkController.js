import Post from '../models/Post.js';
import SavedPost from '../models/SavedPost.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { shapePost, getSavedIdsSet } from './postController.js';

/**
 * @route   POST /api/posts/:postId/save
 * @access  Private
 */
export const savePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).select('_id');
  if (!post) throw new ApiError(404, 'Post not found.');

  const existing = await SavedPost.findOne({ user: req.user._id, post: post._id });
  if (existing) throw new ApiError(409, 'Post already saved.');

  await SavedPost.create({ user: req.user._id, post: post._id });
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedPosts: post._id } });

  res.status(200).json({ success: true, message: 'Post saved' });
});

/**
 * @route   DELETE /api/posts/:postId/save
 * @access  Private
 */
export const unsavePost = asyncHandler(async (req, res) => {
  const deleted = await SavedPost.findOneAndDelete({ user: req.user._id, post: req.params.postId });
  if (!deleted) throw new ApiError(400, 'Post was not saved.');

  await User.findByIdAndUpdate(req.user._id, { $pull: { savedPosts: req.params.postId } });

  res.status(200).json({ success: true, message: 'Post removed from saved' });
});

/**
 * @route   GET /api/users/me/saved
 * @access  Private
 */
export const getSavedPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const saved = await SavedPost.find({ user: req.user._id })
    .populate({
      path: 'post',
      populate: { path: 'author', select: 'username fullName profilePicture isVerified' },
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const posts = saved.map((s) => s.post).filter(Boolean);
  const postIds = posts.map((p) => p._id);
  const savedIds = await getSavedIdsSet(req.user._id, postIds);
  const shapedPosts = posts.map((p) => shapePost(p, req.user._id, savedIds));

  res.status(200).json({
    success: true,
    page,
    hasMore: saved.length === limit,
    posts: shapedPosts,
  });
});
