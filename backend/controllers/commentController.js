import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const POPULATE_AUTHOR = 'username fullName profilePicture isVerified';

/**
 * @route   GET /api/posts/:postId/comments
 * @access  Public
 */
export const getComments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const post = await Post.findById(req.params.postId).select('_id');
  if (!post) throw new ApiError(404, 'Post not found.');

  const comments = await Comment.find({ post: post._id, parentComment: null })
    .populate('author', POPULATE_AUTHOR)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    hasMore: comments.length === limit,
    comments,
  });
});

/**
 * @route   POST /api/posts/:postId/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { text, parentComment = null } = req.body;

  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found.');
  if (post.commentsDisabled) throw new ApiError(403, 'Comments are disabled on this post.');

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    text,
    parentComment,
  });

  post.comments.push(comment._id);
  await post.save();

  await comment.populate('author', POPULATE_AUTHOR);

  if (String(post.author) !== String(req.user._id)) {
    await Notification.create({
      recipient: post.author,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      comment: comment._id,
    });
  }

  res.status(201).json({ success: true, comment });
});

/**
 * @route   DELETE /api/posts/:postId/comments/:commentId
 * @access  Private (comment author OR post author)
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  const [post, comment] = await Promise.all([Post.findById(postId), Comment.findById(commentId)]);

  if (!post) throw new ApiError(404, 'Post not found.');
  if (!comment) throw new ApiError(404, 'Comment not found.');

  const isCommentAuthor = String(comment.author) === String(req.user._id);
  const isPostAuthor = String(post.author) === String(req.user._id);

  if (!isCommentAuthor && !isPostAuthor) {
    throw new ApiError(403, 'You can only delete your own comments.');
  }

  await Comment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] });
  post.comments = post.comments.filter((id) => String(id) !== String(commentId));
  await post.save();

  res.status(200).json({ success: true, message: 'Comment deleted' });
});
