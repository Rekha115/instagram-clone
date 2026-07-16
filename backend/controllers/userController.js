import mongoose from 'mongoose';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * @route   GET /api/users/:username
 * @access  Public (optionalAuth attaches req.user if logged in)
 */
export const getProfile = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const profile = user.toPublicProfile();

  let isFollowedByMe = false;
  let isFollowingMe = false;
  if (req.user) {
    isFollowedByMe = await Follow.exists({ follower: req.user._id, following: user._id });
    isFollowingMe = await Follow.exists({ follower: user._id, following: req.user._id });
  }

  res.status(200).json({
    success: true,
    user: {
      ...profile,
      isFollowedByMe: Boolean(isFollowedByMe),
      isFollowingMe: Boolean(isFollowingMe),
      isMe: req.user ? String(req.user._id) === String(user._id) : false,
    },
  });
});

/**
 * @route   PATCH /api/users/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, fullName, bio, website, gender } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (username !== undefined) {
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername !== user.username) {
      const exists = await User.exists({ username: normalizedUsername });
      if (exists) {
        throw new ApiError(409, 'This username is already taken.');
      }
      user.username = normalizedUsername;
    }
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (website !== undefined) user.website = website;
  if (gender !== undefined) user.gender = gender;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toPublicProfile(),
  });
});

/**
 * @route   PATCH /api/users/me/avatar
 * @access  Private
 * Expects a single file under field name "profilePicture" (see middleware/upload.js)
 */
export const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file was provided.');
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found.');

  // Remove the old avatar from Cloudinary before uploading the new one
  if (user.profilePicture?.publicId) {
    await deleteFromCloudinary(user.profilePicture.publicId, 'image');
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'instagram-clone/avatars',
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  });

  user.profilePicture = { url: result.secure_url, publicId: result.public_id };
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile picture updated',
    user: user.toPublicProfile(),
  });
});

/**
 * @route   GET /api/users/search?q=
 * @access  Public
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const skip = (page - 1) * limit;

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const users = await User.find({
    $or: [{ username: regex }, { fullName: regex }],
  })
    .select('username fullName profilePicture isVerified')
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: users.length,
    page,
    users,
  });
});

/**
 * @route   GET /api/users/suggested
 * @access  Private
 * Suggests users not already followed, prioritizing people who follow
 * users you already follow ("friends of friends"), falling back to
 * recently joined users to fill out the list.
 */
export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const myId = req.user._id;

  const alreadyFollowing = await Follow.find({ follower: myId }).select('following');
  const excludeIds = [myId, ...alreadyFollowing.map((f) => f.following)];

  const friendsOfFriends = await Follow.aggregate([
    { $match: { follower: { $in: alreadyFollowing.map((f) => f.following) } } },
    { $match: { following: { $nin: excludeIds } } },
    { $group: { _id: '$following', mutualCount: { $sum: 1 } } },
    { $sort: { mutualCount: -1 } },
    { $limit: limit },
  ]);

  let suggestedIds = friendsOfFriends.map((f) => f._id);

  if (suggestedIds.length < limit) {
    const fillCount = limit - suggestedIds.length;
    const excludeAll = [...excludeIds, ...suggestedIds];
    const recentUsers = await User.find({ _id: { $nin: excludeAll } })
      .sort({ createdAt: -1 })
      .limit(fillCount)
      .select('_id');
    suggestedIds = [...suggestedIds, ...recentUsers.map((u) => u._id)];
  }

  const users = await User.find({ _id: { $in: suggestedIds } }).select(
    'username fullName profilePicture isVerified'
  );

  res.status(200).json({ success: true, users });
});

/**
 * @route   POST /api/users/:username/follow
 * @access  Private
 */
export const followUser = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const targetUser = await User.findOne({ username });

  if (!targetUser) throw new ApiError(404, 'User not found.');
  if (String(targetUser._id) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot follow yourself.');
  }

  const existing = await Follow.findOne({ follower: req.user._id, following: targetUser._id });
  if (existing) {
    throw new ApiError(409, 'You already follow this user.');
  }

  try {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Follow.create([{ follower: req.user._id, following: targetUser._id }], { session });
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetUser._id } }, { session });
        await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: req.user._id } }, { session });
        await Notification.create(
          [{ recipient: targetUser._id, sender: req.user._id, type: 'follow' }],
          { session }
        );
      });
    } finally {
      session.endSession();
    }
  } catch (error) {
    // Standalone MongoDB instances do not support replica sets/transactions.
    // We fall back to standard sequential execution on transaction error.
    if (
      error.message.includes('replica set') ||
      error.message.includes('Transaction') ||
      error.message.includes('mongos')
    ) {
      await Follow.create({ follower: req.user._id, following: targetUser._id });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetUser._id } });
      await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: req.user._id } });
      await Notification.create({ recipient: targetUser._id, sender: req.user._id, type: 'follow' });
    } else {
      throw error;
    }
  }

  res.status(200).json({ success: true, message: `You are now following ${targetUser.username}` });
});

/**
 * @route   DELETE /api/users/:username/follow
 * @access  Private
 */
export const unfollowUser = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const targetUser = await User.findOne({ username });

  if (!targetUser) throw new ApiError(404, 'User not found.');

  const existing = await Follow.findOneAndDelete({ follower: req.user._id, following: targetUser._id });
  if (!existing) {
    throw new ApiError(400, 'You do not follow this user.');
  }

  await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetUser._id } });
  await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: req.user._id } });

  res.status(200).json({ success: true, message: `You unfollowed ${targetUser.username}` });
});

/**
 * @route   GET /api/users/:username/followers
 * @access  Public
 */
export const getFollowers = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const targetUser = await User.findOne({ username }).select('_id');
  if (!targetUser) throw new ApiError(404, 'User not found.');

  const follows = await Follow.find({ following: targetUser._id })
    .populate('follower', 'username fullName profilePicture isVerified')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const users = follows.map((f) => f.follower).filter(Boolean);
  let formattedUsers = users.map((u) => {
    const obj = typeof u.toObject === 'function' ? u.toObject() : u;
    return { ...obj, isFollowedByMe: false };
  });

  if (req.user && users.length > 0) {
    const userIds = users.map((u) => u._id);
    const myFollows = await Follow.find({
      follower: req.user._id,
      following: { $in: userIds },
    }).select('following');
    const followedIds = new Set(myFollows.map((f) => String(f.following)));
    formattedUsers = formattedUsers.map((u) => ({
      ...u,
      isFollowedByMe: followedIds.has(String(u._id)),
    }));
  }

  res.status(200).json({
    success: true,
    followers: formattedUsers,
  });
});

/**
 * @route   GET /api/users/:username/following
 * @access  Public
 */
export const getFollowing = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const targetUser = await User.findOne({ username }).select('_id');
  if (!targetUser) throw new ApiError(404, 'User not found.');

  const follows = await Follow.find({ follower: targetUser._id })
    .populate('following', 'username fullName profilePicture isVerified')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const users = follows.map((f) => f.following).filter(Boolean);
  let formattedUsers = users.map((u) => {
    const obj = typeof u.toObject === 'function' ? u.toObject() : u;
    return { ...obj, isFollowedByMe: false };
  });

  if (req.user && users.length > 0) {
    const userIds = users.map((u) => u._id);
    const myFollows = await Follow.find({
      follower: req.user._id,
      following: { $in: userIds },
    }).select('following');
    const followedIds = new Set(myFollows.map((f) => String(f.following)));
    formattedUsers = formattedUsers.map((u) => ({
      ...u,
      isFollowedByMe: followedIds.has(String(u._id)),
    }));
  }

  res.status(200).json({
    success: true,
    following: formattedUsers,
  });
});
