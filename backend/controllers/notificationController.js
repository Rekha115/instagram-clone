import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';

const POPULATE_SENDER = 'username fullName profilePicture isVerified';

/**
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', POPULATE_SENDER)
    .populate('post', 'media')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    hasMore: notifications.length === limit,
    notifications,
  });
});

/**
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
  res.status(200).json({ success: true, count });
});

/**
 * @route   PATCH /api/notifications/:notificationId/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.notificationId, recipient: req.user._id },
    { $set: { read: true } }
  );
  res.status(200).json({ success: true });
});

/**
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});
