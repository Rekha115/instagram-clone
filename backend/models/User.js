import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9._]+$/, 'Username can only contain lowercase letters, numbers, dots, and underscores'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [50, 'Full name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [150, 'Bio cannot exceed 150 characters'],
    },
    profilePicture: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    website: {
      type: String,
      default: '',
      maxlength: 100,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'prefer-not-to-say', ''],
      default: '',
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        type: String,
        select: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for full-text search across username and fullName.
// Note: email and username already get unique indexes automatically
// from their `unique: true` schema options above.
userSchema.index({ username: 'text', fullName: 'text' });

// Hash password before saving, only if it was modified
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare a plaintext password with the hashed one
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to return a safe, public-facing version of the user
userSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    email: this.email,
    bio: this.bio,
    profilePicture: this.profilePicture,
    website: this.website,
    gender: this.gender,
    followersCount: this.followers?.length || 0,
    followingCount: this.following?.length || 0,
    isPrivate: this.isPrivate,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
