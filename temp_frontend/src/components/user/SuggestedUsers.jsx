import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import FollowButton from './FollowButton';
import { getSuggestedUsersRequest } from '../../api/users';

export default function SuggestedUsers() {
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSuggestedUsersRequest(5)
      .then((res) => setUsers(res.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && users.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-ig-dim font-semibold text-sm mb-3">Suggested for you</p>
      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u._id} className="flex items-center justify-between">
            <Link to={`/${u.username}`} className="flex items-center gap-3 min-w-0">
              <Avatar user={u} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{u.username}</p>
                <p className="text-xs text-ig-dim truncate">{u.fullName}</p>
              </div>
            </Link>
            <FollowButton username={u.username} isFollowing={false} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
