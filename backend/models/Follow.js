import mongoose from 'mongoose';

/**
 * While User.followers / User.following store quick-access arrays,
 * this collection is the source of truth for follow relationships.
 * It allows efficient queries like "does A follow B" without loading
 * entire user documents, and enforces a uniqueness constraint so the
 * same follow relationship can never be created twice.
 */
const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
