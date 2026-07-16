import { useState } from 'react';
import toast from 'react-hot-toast';
import { followUserRequest, unfollowUserRequest } from '../../api/users';
import { cx } from '../../utils/helpers';
import { Spinner } from '../common/Loader';

export default function FollowButton({ username, isFollowing, onChange, className = '', size = 'md' }) {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    const next = !following;
    setLoading(true);
    setFollowing(next);
    try {
      next ? await followUserRequest(username) : await unfollowUserRequest(username);
      onChange?.(next);
    } catch (err) {
      setFollowing(!next);
      toast.error(err.friendlyMessage || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cx(
        'font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors',
        size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-1.5',
        following
          ? 'bg-ig-surface2 hover:bg-white/10 text-white'
          : 'bg-ig-blue hover:bg-ig-blueDim text-white',
        className
      )}
    >
      {loading && <Spinner size={12} />}
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
