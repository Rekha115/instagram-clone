import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import Avatar from '../common/Avatar';
import FollowButton from './FollowButton';
import { timeAgo } from '../../utils/helpers';

const ICONS = {
  like: <Heart size={14} className="fill-ig-red text-ig-red" />,
  comment: <MessageCircle size={14} />,
  follow: <UserPlus size={14} />,
  mention: <AtSign size={14} />,
};

const TEXT = {
  like: 'liked your post.',
  comment: 'commented on your post.',
  follow: 'started following you.',
  mention: 'mentioned you.',
};

export default function NotificationItem({ notification }) {
  const { sender, type, post, createdAt, read } = notification;
  const thumb = post?.media?.[0];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!read ? 'bg-white/5' : ''}`}>
      <Link to={`/${sender?.username}`} className="relative shrink-0">
        <Avatar user={sender} size="md" />
        <span className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">{ICONS[type]}</span>
      </Link>
      <p className="text-sm flex-1 min-w-0">
        <Link to={`/${sender?.username}`} className="font-semibold mr-1">
          {sender?.username}
        </Link>
        {TEXT[type] || 'interacted with you.'}{' '}
        <span className="text-ig-dim">{timeAgo(createdAt)}</span>
      </p>

      {type === 'follow' ? (
        <FollowButton username={sender?.username} isFollowing={false} size="sm" />
      ) : thumb ? (
        <Link to={`/p/${post._id}`} className="w-11 h-11 shrink-0 rounded overflow-hidden bg-ig-surface2">
          {thumb.type === 'video' ? (
            <video src={thumb.url} className="w-full h-full object-cover" muted />
          ) : (
            <img src={thumb.url} className="w-full h-full object-cover" alt="" />
          )}
        </Link>
      ) : null}
    </div>
  );
}
