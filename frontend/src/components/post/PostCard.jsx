import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import { cx, formatCount, timeAgo } from '../../utils/helpers';
import { likePostRequest, unlikePostRequest, savePostRequest, unsavePostRequest, deletePostRequest } from '../../api/posts';
import { addCommentRequest } from '../../api/comments';
import useAuth from '../../hooks/useAuth';
import MediaCarousel from './MediaCarousel';

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [saved, setSaved] = useState(!!post.isSavedByMe);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? post.comments?.length ?? 0);
  const [showHeart, setShowHeart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lastTap = useRef(0);

  const isOwner = user && post.author?._id === user._id;

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const res = next ? await likePostRequest(post._id) : await unlikePostRequest(post._id);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      setLiked(!next);
      setLikesCount((c) => Math.max(0, c + (next ? -1 : 1)));
      if (err.response?.status !== 409) toast.error(err.friendlyMessage || 'Something went wrong');
    }
  };

  const toggleSave = async () => {
    const next = !saved;
    setSaved(next);
    try {
      next ? await savePostRequest(post._id) : await unsavePostRequest(post._id);
      toast.success(next ? 'Saved' : 'Removed from saved');
    } catch (err) {
      setSaved(!next);
      toast.error(err.friendlyMessage || 'Something went wrong');
    }
  };

  const handleMediaDoubleClick = () => {
    if (!liked) toggleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  };

  const handleMediaTap = () => {
    // basic double-tap support for touch devices
    const now = Date.now();
    if (now - lastTap.current < 300) handleMediaDoubleClick();
    lastTap.current = now;
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      await addCommentRequest(post._id, text);
      setCommentsCount((c) => c + 1);
      setCommentText('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePostRequest(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to delete post');
    }
  };

  const caption = post.caption || '';
  const captionIsLong = caption.length > 150;

  return (
    <article className="border-b border-white/5 sm:border sm:border-white/10 sm:rounded-2xl mb-6 bg-black shadow-lg overflow-hidden transition-all duration-300">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to={`/${post.author?.username}`} className="flex items-center gap-3">
          <Avatar user={post.author} size="sm" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-white">{post.author?.username}</span>
            {post.location && <span className="text-ig-dim hidden sm:inline">• {post.location}</span>}
          </div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="p-1 text-white/80 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-40 bg-ig-surface border border-white/10 rounded-xl overflow-hidden z-10 animate-fadeIn shadow-2xl p-1">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ig-red hover:bg-white/5 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button
                onClick={() => {
                  navigate(`/p/${post._id}`);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors text-white"
              >
                Go to post
              </button>
            </div>
          )}
        </div>
      </header>

      <div onClick={handleMediaTap} className="cursor-pointer">
        <MediaCarousel media={post.media} onDoubleClick={handleMediaDoubleClick} showHeart={showHeart} />
      </div>

      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={toggleLike} aria-label="Like" className="transition-transform active:scale-75">
              <Heart
                size={24}
                className={cx(liked && 'fill-ig-red text-ig-red', !liked && 'text-white hover:text-white/75')}
              />
            </button>
            <button onClick={() => navigate(`/p/${post._id}`)} aria-label="Comment" className="transition-transform active:scale-75">
              <MessageCircle size={24} className="text-white hover:text-white/75" />
            </button>
            <button aria-label="Share" className="transition-transform active:scale-75 text-white hover:text-white/75">
              <Send size={22} />
            </button>
          </div>
          <button onClick={toggleSave} aria-label="Save" className="transition-transform active:scale-75">
            <Bookmark size={22} className={cx(saved && 'fill-white text-white', !saved && 'text-white')} />
          </button>
        </div>

        {likesCount > 0 && <p className="font-semibold text-sm mt-2 text-white">{formatCount(likesCount)} likes</p>}

        {caption && (
          <p className="text-sm mt-1.5 leading-relaxed text-white/90">
            <Link to={`/${post.author?.username}`} className="font-semibold mr-2 text-white hover:underline">
              {post.author?.username}
            </Link>
            {captionIsLong && !expanded ? `${caption.slice(0, 150)}...` : caption}
            {captionIsLong && (
              <button onClick={() => setExpanded((v) => !v)} className="text-ig-dim hover:text-white/80 ml-1.5 font-medium transition-colors">
                {expanded ? 'less' : 'more'}
              </button>
            )}
          </p>
        )}

        {commentsCount > 0 && (
          <button
            onClick={() => navigate(`/p/${post._id}`)}
            className="text-sm text-ig-dim hover:text-white/80 mt-2 block transition-colors"
          >
            View all {formatCount(commentsCount)} comments
          </button>
        )}

        <p className="text-[10px] text-ig-dim uppercase tracking-wider mt-2.5 mb-1.5">
          {timeAgo(post.createdAt)} ago
        </p>
      </div>

      {!post.commentsDisabled && (
        <form onSubmit={handleAddComment} className="flex items-center gap-3 px-4 py-3 border-t border-white/5 mt-1 bg-white/[0.01]">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-ig-dim text-white"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || posting}
            className="text-ig-blue hover:text-blue-400 font-semibold text-sm disabled:opacity-40 transition-colors"
          >
            Post
          </button>
        </form>
      )}
    </article>
  );
}
