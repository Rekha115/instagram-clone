import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeedRequest } from '../api/posts';
import PostCard from '../components/post/PostCard';
import { Spinner } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { Camera } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import SuggestedUsers from '../components/user/SuggestedUsers';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef(null);

  const loadPage = useCallback((p) => {
    setLoading(true);
    getFeedRequest({ page: p, limit: 10 })
      .then((res) => {
        setPosts((prev) => (p === 1 ? res.data.posts : [...prev, ...res.data.posts]));
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
      (entries) => {
        if (entries[0].isIntersecting) loadPage(page + 1);
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, loadPage]);

  const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <div className="max-w-[935px] mx-auto flex gap-8 px-0 sm:px-4 pt-4 sm:pt-8">
      <div className="flex-1 max-w-[470px] mx-auto sm:mx-0 w-full">
        {loading && posts.length === 0 && (
          <div className="flex justify-center py-16">
            <Spinner size={28} />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <EmptyState
            icon={Camera}
            title="Welcome to your feed"
            subtitle="Follow people to see their photos and videos here."
            action={
              <Link to="/explore" className="text-ig-blue font-semibold text-sm">
                Find people to follow
              </Link>
            }
          />
        )}

        {posts.map((post) => (
          <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
        ))}

        <div ref={sentinelRef} className="h-1" />
        {loading && posts.length > 0 && (
          <div className="flex justify-center py-6">
            <Spinner size={22} />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-ig-dim text-sm py-8">You&apos;re all caught up</p>
        )}
      </div>

      <div className="hidden lg:block w-[320px] pt-2">
        <div className="flex items-center justify-between">
          <Link to={`/${user?.username}`} className="flex items-center gap-3">
            <Avatar user={user} size="lg" />
            <div>
              <p className="text-sm font-semibold">{user?.username}</p>
              <p className="text-sm text-ig-dim">{user?.fullName}</p>
            </div>
          </Link>
        </div>
        <SuggestedUsers />
      </div>
    </div>
  );
}
