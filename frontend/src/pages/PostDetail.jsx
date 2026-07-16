import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, Bookmark, Send, MoreHorizontal, ChevronLeft, Trash2 } from 'lucide-react';
import { getPostByIdRequest, likePostRequest, unlikePostRequest, savePostRequest, unsavePostRequest, deletePostRequest } from '../api/posts';
import Avatar from '../components/common/Avatar';
import { Spinner } from '../components/common/Loader';
import MediaCarousel from '../components/post/MediaCarousel';
import CommentList from '../components/post/CommentList';
import EmptyState from '../components/common/EmptyState';
import { cx, formatCount, timeAgo } from '../utils/helpers';
import useAuth from '../hooks/useAuth';

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getPostByIdRequest(postId)
      .then((res) => {
        const p = res.data.post;
        setPost(p);
        setLiked(p.isLikedByMe);
        setLikesCount(p.likesCount ?? 0);
        setSaved(!!p.isSavedByMe);
        setCommentsCount(p.commentsCount ?? p.comments?.length ?? 0);
      })
      .catch((err) => {
        if (err.response?.status === 404 || err.response?.status === 400) setNotFound(true);
        else toast.error(err.friendlyMessage || 'Failed to load post');
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const res = next ? await likePostRequest(postId) : await unlikePostRequest(postId);
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
      next ? await savePostRequest(postId) : await unsavePostRequest(postId);
      toast.success(next ? 'Saved' : 'Removed from saved');
    } catch (err) {
      setSaved(!next);
      toast.error(err.friendlyMessage || 'Something went wrong');
    }
  };

  const handleDoubleClick = () => {
    if (!liked) toggleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePostRequest(postId);
      toast.success('Post deleted');
      navigate(`/${post.author.username}`);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (notFound || !post) {
    return <EmptyState title="Sorry, this page isn't available." subtitle="The link you followed may be broken, or the post may have been removed." />;
  }

  const isOwner = user && post.author?._id === user._id;

  return (
    <div className="max-w-5xl mx-auto sm:pt-8 pb-12 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm py-3 text-white/80 hover:text-white sm:hidden transition-colors">
        <ChevronLeft size={20} /> Back
      </button>

      <div className="sm:border sm:border-white/10 sm:rounded-2xl flex flex-col md:flex-row bg-black overflow-hidden shadow-2xl">
        <div className="md:w-[60%] bg-black flex items-center justify-center" onDoubleClick={handleDoubleClick}>
          <MediaCarousel media={post.media} showHeart={showHeart} aspect="aspect-square" onDoubleClick={handleDoubleClick} />
        </div>

        <div className="md:w-[40%] flex flex-col border-l border-white/10 max-h-[80vh] md:max-h-none bg-ig-surface/20">
          <header className="flex items-center justify-between px-4 py-4 border-b border-white/5">
            <Link to={`/${post.author?.username}`} className="flex items-center gap-3">
              <Avatar user={post.author} size="sm" />
              <span className="text-sm font-semibold text-white">{post.author?.username}</span>
            </Link>
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} className="text-white/80 hover:text-white transition-colors">
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && isOwner && (
                <div className="absolute right-0 top-8 w-40 bg-ig-surface border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl p-1">
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ig-red hover:bg-white/5 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </header>

          {post.caption && (
            <div className="flex items-start gap-3 px-4 py-4 border-b border-white/5 bg-white/[0.01]">
              <Avatar user={post.author} size="sm" />
              <p className="text-sm leading-relaxed text-white/90">
                <Link to={`/${post.author?.username}`} className="font-semibold mr-2 text-white hover:underline">
                  {post.author?.username}
                </Link>
                {post.caption}
              </p>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <CommentList
              postId={post._id}
              postAuthorId={post.author?._id}
              commentsDisabled={post.commentsDisabled}
              onCountChange={(updater) => setCommentsCount(updater)}
            />
          </div>

          <div className="border-t border-white/5 px-4 py-4 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button onClick={toggleLike} className="transition-transform active:scale-75 text-white">
                  <Heart size={24} className={cx(liked && 'fill-ig-red text-ig-red')} />
                </button>
                <button className="transition-transform active:scale-75 text-white">
                  <Send size={22} />
                </button>
              </div>
              <button onClick={toggleSave} className="transition-transform active:scale-75 text-white">
                <Bookmark size={22} className={cx(saved && 'fill-white')} />
              </button>
            </div>
            {likesCount > 0 && <p className="font-semibold text-sm text-white">{formatCount(likesCount)} likes</p>}
            <p className="text-[10px] text-ig-dim uppercase tracking-wider mt-2">
              {timeAgo(post.createdAt)} ago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
