import { useCallback, useEffect, useRef, useState } from 'react';
import { getExploreRequest } from '../api/posts';
import PostGrid from '../components/post/PostGrid';
import { Spinner } from '../components/common/Loader';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef(null);

  const loadPage = useCallback((p) => {
    setLoading(true);
    getExploreRequest({ page: p, limit: 21 })
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
      (entries) => entries[0].isIntersecting && loadPage(page + 1),
      { rootMargin: '400px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, loadPage]);

  return (
    <div className="max-w-[935px] mx-auto pt-4 sm:pt-8 px-0.5 sm:px-4">
      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : (
        <PostGrid posts={posts} />
      )}
      <div ref={sentinelRef} className="h-1" />
      {loading && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <Spinner size={22} />
        </div>
      )}
    </div>
  );
}
