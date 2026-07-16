import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Layers, Clapperboard } from 'lucide-react';
import { formatCount } from '../../utils/helpers';

export default function PostGrid({ posts = [] }) {
  if (posts.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
      {posts.map((post) => {
        const thumb = post.media?.[0];
        return (
          <Link
            key={post._id}
            to={`/p/${post._id}`}
            className="relative aspect-square bg-ig-surface2 group overflow-hidden"
          >
            {thumb?.type === 'video' ? (
              <video src={thumb.url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={thumb?.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            )}

            {post.media?.length > 1 && (
              <Layers size={16} className="absolute top-2 right-2 text-white drop-shadow" />
            )}
            {post.postType === 'reel' && (
              <Clapperboard size={16} className="absolute top-2 right-2 text-white drop-shadow" />
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
              <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
                <Heart size={18} fill="white" /> {formatCount(post.likesCount ?? post.likes?.length ?? 0)}
              </span>
              <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
                <MessageCircle size={18} fill="white" />{' '}
                {formatCount(post.commentsCount ?? post.comments?.length ?? 0)}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
