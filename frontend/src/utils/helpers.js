import { formatDistanceToNowStrict } from 'date-fns';

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

// User.profilePicture is { url: '', publicId: '' } by default on the
// backend (no seeded placeholder), so fall back to a generated avatar.
export function avatarUrl(user) {
  const url = user?.profilePicture?.url;
  if (url) return url;
  const seed = encodeURIComponent(user?.username || user?.fullName || 'user');
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundColor=1a1a1a`;
}

export function timeAgo(date) {
  if (!date) return '';
  try {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: false })
      .replace('minutes', 'm')
      .replace('minute', 'm')
      .replace('hours', 'h')
      .replace('hour', 'h')
      .replace('days', 'd')
      .replace('day', 'd')
      .replace('weeks', 'w')
      .replace('week', 'w')
      .replace('months', 'mo')
      .replace('month', 'mo')
      .replace('years', 'y')
      .replace('year', 'y')
      .replace('seconds', 's')
      .replace('second', 's')
      .replace(/\s+/g, '');
  } catch {
    return '';
  }
}

export function formatCount(n) {
  const num = Number(n) || 0;
  if (num < 1000) return String(num);
  if (num < 1_000_000) return `${(num / 1000).toFixed(num % 1000 >= 100 ? 1 : 0)}K`;
  return `${(num / 1_000_000).toFixed(1)}M`;
}
