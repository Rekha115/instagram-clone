import mongoose from 'mongoose';

/**
 * Tracks bookmarks with their own timestamp so the "Saved" tab
 * on a profile can be ordered by when the post was saved,
 * independent of the User.savedPosts array (which is kept in
 * sync for quick membership checks like "is this post saved?").
 */
const savedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

savedPostSchema.index({ user: 1, post: 1 }, { unique: true });
savedPostSchema.index({ user: 1, createdAt: -1 });

const SavedPost = mongoose.model('SavedPost', savedPostSchema);

export default SavedPost;
