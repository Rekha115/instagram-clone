import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Send, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getReelsRequest } from '../api/posts';
import { likePostRequest, unlikePostRequest } from '../api/posts';
import Avatar from '../components/common/Avatar';
import { Spinner } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { Clapperboard } from 'lucide-react';
import { cx, formatCount } from '../utils/helpers';

function ReelItem({ reel }) {
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(reel.isLikedByMe);
  const [likesCount, setLikesCount] = useState(reel.likesCount ?? 0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setPlaying(true)).catch((err) => console.log('Autoplay blocked or failed:', err));
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const res = next ? await likePostRequest(reel._id) : await unlikePostRequest(reel._id);
      setLikesCount(res.data.likesCount);
    } catch {
      setLiked(!next);
      setLikesCount((c) => Math.max(0, c + (next ? -1 : 1)));
    }
  };

  const media = reel.media?.[0];

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen snap-start flex items-center justify-center relative bg-black">
      <video
        ref={videoRef}
        src={media?.url}
        loop
        muted={muted}
        playsInline
        autoPlay
        preload="auto"
        onClick={() => (playing ? videoRef.current.pause() : videoRef.current.play())}
        className="h-full max-h-full w-auto max-w-full object-contain"
      />

      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className="absolute bottom-6 left-4 right-16 text-white">
        <Link to={`/${reel.author?.username}`} className="flex items-center gap-2 mb-2">
          <Avatar user={reel.author} size="sm" />
          <span className="font-semibold text-sm">{reel.author?.username}</span>
        </Link>
        {reel.caption && <p className="text-sm line-clamp-2">{reel.caption}</p>}
      </div>

      <div className="absolute bottom-10 right-3 flex flex-col items-center gap-5 text-white">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1">
          <Heart size={26} className={cx(liked && 'fill-ig-red text-ig-red')} />
          <span className="text-xs">{formatCount(likesCount)}</span>
        </button>
        <Link to={`/p/${reel._id}`} className="flex flex-col items-center gap-1">
          <MessageCircle size={26} />
          <span className="text-xs">{formatCount(reel.commentsCount ?? 0)}</span>
        </Link>
        <button className="flex flex-col items-center gap-1">
          <Send size={24} />
        </button>
      </div>
    </div>
  );
}

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef(null);

  const loadPage = useCallback((p) => {
    setLoading(true);
    getReelsRequest({ page: p, limit: 10 })
      .then((res) => {
        setReels((prev) => (p === 1 ? res.data.reels : [...prev, ...res.data.reels]));
        setHasMore(res.data.hasMore);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    if (!sentinelRef.current || loading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadPage(page + 1),
      { rootMargin: '800px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, loadPage]);

  if (loading && reels.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-56px)] md:h-screen">
        <Spinner size={28} />
      </div>
    );
  }

  if (!loading && reels.length === 0) {
    return <EmptyState icon={Clapperboard} title="No reels yet" subtitle="Reels shared by the community will show up here." />;
  }

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar">
      {reels.map((reel) => (
        <ReelItem key={reel._id} reel={reel} />
      ))}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
