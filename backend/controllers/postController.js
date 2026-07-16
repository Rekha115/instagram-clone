import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import SavedPost from '../models/SavedPost.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const POPULATE_AUTHOR = 'username fullName profilePicture isVerified';

/**
 * Shapes a post document for API responses, adding viewer-specific
 * flags (isLikedByMe, isSavedByMe) when a user is authenticated.
 * `savedIds`, when provided, is a Set of post-id strings the viewer
 * has bookmarked (see getSavedIdsSet below).
 */
export const shapePost = (post, viewerId, savedIds = null) => {
  const obj = typeof post.toObject === 'function' ? post.toObject() : post;
  return {
    ...obj,
    isLikedByMe: viewerId ? obj.likes.some((id) => String(id) === String(viewerId)) : false,
    isSavedByMe: savedIds ? savedIds.has(String(obj._id)) : false,
    likes: undefined,
    likesArray: undefined,
  };
};

/**
 * Batch-checks which of the given post ids the viewer has bookmarked,
 * in a single query, so list endpoints (feed/explore/reels) don't need
 * an N+1 lookup per post. Returns an empty Set for guests.
 */
export const getSavedIdsSet = async (viewerId, postIds) => {
  if (!viewerId || postIds.length === 0) return new Set();
  const saved = await SavedPost.find({ user: viewerId, post: { $in: postIds } }).select('post');
  return new Set(saved.map((s) => String(s.post)));
};

/**
 * @route   POST /api/posts
 * @access  Private
 * Expects files under field name "media" (see middleware/upload.js -> uploadPostMedia)
 */
export const createPost = asyncHandler(async (req, res) => {
  const { caption = '', location = '', postType = 'post' } = req.body;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one image or video is required.');
  }

  const uploadedMedia = await Promise.all(
    req.files.map(async (file) => {
      const isVideo = file.mimetype.startsWith('video/');
      const result = await uploadBufferToCloudinary(file.buffer, {
        folder: 'instagram-clone/posts',
        resource_type: isVideo ? 'video' : 'image',
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        type: isVideo ? 'video' : 'image',
      };
    })
  );

  const post = await Post.create({
    author: req.user._id,
    caption,
    location,
    postType,
    media: uploadedMedia,
  });

  await post.populate('author', POPULATE_AUTHOR);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    post: shapePost(post, req.user._id),
  });
});

/**
 * @route   GET /api/posts/:postId
 * @access  Public (optionalAuth)
 */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).populate('author', POPULATE_AUTHOR);
  if (!post) throw new ApiError(404, 'Post not found.');

  const savedIds = await getSavedIdsSet(req.user?._id, [post._id]);
  res.status(200).json({ success: true, post: shapePost(post, req.user?._id, savedIds) });
});

/**
 * @route   PATCH /api/posts/:postId
 * @access  Private (author only)
 */
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found.');

  if (String(post.author) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own posts.');
  }

  const { caption, location } = req.body;
  if (caption !== undefined) post.caption = caption;
  if (location !== undefined) post.location = location;

  await post.save();
  await post.populate('author', POPULATE_AUTHOR);

  const savedIds = await getSavedIdsSet(req.user._id, [post._id]);
  res.status(200).json({
    success: true,
    message: 'Post updated',
    post: shapePost(post, req.user._id, savedIds),
  });
});

/**
 * @route   DELETE /api/posts/:postId
 * @access  Private (author only)
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found.');

  if (String(post.author) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only delete your own posts.');
  }

  await Promise.all(
    post.media.map((m) => deleteFromCloudinary(m.publicId, m.type === 'video' ? 'video' : 'image'))
  );

  await Comment.deleteMany({ post: post._id });
  await Notification.deleteMany({ post: post._id });
  await User.updateMany({ savedPosts: post._id }, { $pull: { savedPosts: post._id } });
  await SavedPost.deleteMany({ post: post._id });
  await post.deleteOne();

  res.status(200).json({ success: true, message: 'Post deleted successfully' });
});

/**
 * @route   POST /api/posts/:postId/like
 * @access  Private
 */
export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found.');

  const alreadyLiked = post.likes.some((id) => String(id) === String(req.user._id));
  if (alreadyLiked) {
    throw new ApiError(409, 'You already liked this post.');
  }

  post.likes.push(req.user._id);
  await post.save();

  if (String(post.author) !== String(req.user._id)) {
    await Notification.create({
      recipient: post.author,
      sender: req.user._id,
      type: 'like',
      post: post._id,
    });
  }

  res.status(200).json({ success: true, likesCount: post.likes.length });
});

/**
 * @route   DELETE /api/posts/:postId/like
 * @access  Private
 */
export const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found.');

  const wasLiked = post.likes.some((id) => String(id) === String(req.user._id));
  if (!wasLiked) {
    throw new ApiError(400, 'You have not liked this post.');
  }

  post.likes = post.likes.filter((id) => String(id) !== String(req.user._id));
  await post.save();

  // Remove the like notification from recipient
  await Notification.findOneAndDelete({
    recipient: post.author,
    sender: req.user._id,
    type: 'like',
    post: post._id,
  });

  res.status(200).json({ success: true, likesCount: post.likes.length });
});

/**
 * @route   GET /api/posts/feed
 * @access  Private
 * Returns posts from users the current user follows, newest first,
 * with cursor-free page/limit pagination suitable for infinite scroll.
 */
export const getFeed = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const follows = await Follow.find({ follower: req.user._id }).select('following');
  const followingIds = follows.map((f) => f.following);
  // Include the user's own posts in their feed, matching Instagram's behavior
  followingIds.push(req.user._id);

  const posts = await Post.find({ author: { $in: followingIds }, postType: 'post' })
    .populate('author', POPULATE_AUTHOR)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const savedIds = await getSavedIdsSet(req.user._id, posts.map((p) => p._id));

  res.status(200).json({
    success: true,
    page,
    hasMore: posts.length === limit,
    posts: posts.map((p) => shapePost(p, req.user._id, savedIds)),
  });
});

/**
 * @route   GET /api/posts/explore
 * @access  Public (optionalAuth)
 * Returns a broad mix of posts for discovery, biased toward
 * recent + popular content.
 */
export const getExplore = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 21;

  const posts = await Post.aggregate([
    { $match: { postType: 'post' } },
    { $addFields: { likesCount: { $size: '$likes' } } },
    { $sort: { likesCount: -1, createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  await Post.populate(posts, { path: 'author', select: POPULATE_AUTHOR });

  const savedIds = await getSavedIdsSet(req.user?._id, posts.map((p) => p._id));

  res.status(200).json({
    success: true,
    page,
    hasMore: posts.length === limit,
    posts: posts.map((p) => shapePost(p, req.user?._id, savedIds)),
  });
});

/**
 * @route   GET /api/posts/reels
 * @access  Public (optionalAuth)
 */
export const getReels = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const reels = await Post.find({ postType: 'reel' })
    .populate('author', POPULATE_AUTHOR)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const savedIds = await getSavedIdsSet(req.user?._id, reels.map((r) => r._id));

  res.status(200).json({
    success: true,
    page,
    hasMore: reels.length === limit,
    reels: reels.map((r) => shapePost(r, req.user?._id, savedIds)),
  });
});

/**
 * @route   GET /api/posts/user/:username
 * @access  Public
 * Used for a profile's grid gallery.
 */
export const getUserPosts = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const user = await User.findOne({ username }).select('_id');
  if (!user) throw new ApiError(404, 'User not found.');

  const posts = await Post.find({ author: user._id, postType: 'post' })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    // NOTE: likesCount/commentsCount are virtuals derived from the likes/comments
    // arrays (see models/Post.js), not real schema paths — select() can only
    // include real fields, so we select the underlying arrays here to let the
    // virtuals compute correctly, then map to a lean shape below so the raw
    // liker/commenter id arrays never actually reach the client.
    .select('media likes comments createdAt');

  const leanPosts = posts.map((p) => ({
    _id: p._id,
    media: p.media,
    likesCount: p.likesCount,
    commentsCount: p.commentsCount,
    createdAt: p.createdAt,
  }));

  res.status(200).json({
    success: true,
    page,
    hasMore: posts.length === limit,
    posts: leanPosts,
  });
});
