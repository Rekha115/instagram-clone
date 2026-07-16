import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import { Spinner } from '../common/Loader';
import { timeAgo } from '../../utils/helpers';
import { getCommentsRequest, addCommentRequest, deleteCommentRequest } from '../../api/comments';
import useAuth from '../../hooks/useAuth';

export default function CommentList({ postId, postAuthorId, commentsDisabled, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const loadPage = (p) => {
    setLoading(true);
    getCommentsRequest(postId, { page: p, limit: 20 })
      .then((res) => {
        setComments((prev) => (p === 1 ? res.data.comments : [...prev, ...res.data.comments]));
        setHasMore(res.data.hasMore);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || posting) return;
    setPosting(true);
    try {
      const res = await addCommentRequest(postId, value);
      setComments((prev) => [res.data.comment, ...prev]);
      onCountChange?.((c) => c + 1);
      setText('');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteCommentRequest(postId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      onCountChange?.((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to delete comment');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {comments.map((c) => {
          const canDelete = user && (user._id === c.author?._id || user._id === postAuthorId);
          return (
            <div key={c._id} className="flex items-start gap-2.5 group">
              <Link to={`/${c.author?.username}`}>
                <Avatar user={c.author} size="sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm break-words">
                  <Link to={`/${c.author?.username}`} className="font-semibold mr-1.5">
                    {c.author?.username}
                  </Link>
                  {c.text}
                </p>
                <p className="text-[11px] text-ig-dim mt-0.5">{timeAgo(c.createdAt)} ago</p>
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDelete(c._id)}
                  className="opacity-0 group-hover:opacity-100 text-ig-dim hover:text-ig-red shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-center py-4">
            <Spinner size={20} />
          </div>
        )}

        {!loading && comments.length === 0 && (
          <p className="text-center text-ig-dim text-sm py-8">No comments yet.</p>
        )}

        {!loading && hasMore && (
          <button
            onClick={() => loadPage(page + 1)}
            className="text-ig-dim text-sm hover:text-white block mx-auto"
          >
            Load more comments
          </button>
        )}
      </div>

      {!commentsDisabled && (
        <form onSubmit={handleAdd} className="flex items-center gap-3 px-4 py-3.5 border-t border-white/5 bg-white/[0.01]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            maxLength={500}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-ig-dim text-white"
          />
          <button
            type="submit"
            disabled={!text.trim() || posting}
            className="text-ig-blue hover:text-blue-400 font-semibold text-sm disabled:opacity-40 transition-colors"
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
}
