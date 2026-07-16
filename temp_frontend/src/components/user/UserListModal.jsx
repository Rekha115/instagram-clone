import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import { Spinner } from '../common/Loader';
import FollowButton from './FollowButton';
import { getFollowersRequest, getFollowingRequest } from '../../api/users';
import useAuth from '../../hooks/useAuth';

export default function UserListModal({ open, onClose, username, mode }) {
  // mode: 'followers' | 'following'
  const { user: me } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !username) return;
    setLoading(true);
    const request = mode === 'followers' ? getFollowersRequest : getFollowingRequest;
    request(username, { limit: 50 })
      .then((res) => setList(res.data[mode] || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [open, username, mode]);

  return (
    <Modal open={open} onClose={onClose} className="max-w-sm">
      <div className="border-b border-ig-border py-3 text-center font-semibold capitalize">{mode}</div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size={22} />
          </div>
        )}
        {!loading && list.length === 0 && (
          <p className="text-center text-ig-dim text-sm py-8">No users to show.</p>
        )}
        {list.map((u) => (
          <div key={u._id} className="flex items-center justify-between px-2 py-2">
            <Link to={`/${u.username}`} onClick={onClose} className="flex items-center gap-3 min-w-0">
              <Avatar user={u} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{u.username}</p>
                <p className="text-sm text-ig-dim truncate">{u.fullName}</p>
              </div>
            </Link>
            {me && me.username !== u.username && (
              <FollowButton username={u.username} isFollowing={!!u.isFollowedByMe} size="sm" />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
