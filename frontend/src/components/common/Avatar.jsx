import { BadgeCheck } from 'lucide-react';
import { avatarUrl, cx } from '../../utils/helpers';

const SIZES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-36 h-36',
};

export default function Avatar({ user, size = 'md', ring = false, className = '' }) {
  return (
    <div className={cx('relative shrink-0', SIZES[size], className)}>
      <img
        src={avatarUrl(user)}
        alt={user?.username || 'user'}
        className={cx(
          'w-full h-full rounded-full object-cover bg-ig-surface2',
          ring && 'ring-2 ring-offset-2 ring-offset-black ring-pink-500'
        )}
      />
      {user?.isVerified && (
        <BadgeCheck
          className="absolute bottom-0 right-0 text-ig-blue bg-black rounded-full"
          size={size === '2xl' ? 22 : size === 'xl' ? 18 : 14}
          fill="#0095f6"
          color="#000"
        />
      )}
    </div>
  );
}
