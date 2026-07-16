import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendTokenResponse } from '../utils/generateToken.js';

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    throw new ApiError(409, 'This username is already taken.');
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email: email.toLowerCase(),
    password,
  });

  const token = sendTokenResponse(res, user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.toPublicProfile(),
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 * Accepts either email or username in the "identifier" field.
 */
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const normalized = identifier.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: normalized }, { username: normalized }],
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const token = sendTokenResponse(res, user._id);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: user.toPublicProfile(),
  });
});

/**
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 * Returns the currently authenticated user, used on app load to
 * implement persistent login.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.status(200).json({
    success: true,
    user: user.toPublicProfile(),
  });
});

/**
 * @route   GET /api/auth/check-username/:username
 * @access  Public
 * Lets the signup form check availability as the user types.
 */
export const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const exists = await User.exists({ username });

  res.status(200).json({
    success: true,
    available: !exists,
  });
});
