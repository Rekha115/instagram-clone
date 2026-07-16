import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { getNotificationsRequest, markAllNotificationsReadRequest } from '../api/notifications';
import NotificationItem from '../components/user/NotificationItem';
import { Spinner } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef(null);

  const loadPage = useCallback((p) => {
    setLoading(true);
    getNotificationsRequest({ page: p, limit: 20 })
      .then((res) => {
        setNotifications((prev) => (p === 1 ? res.data.notifications : [...prev, ...res.data.notifications]));
        setHasMore(res.data.hasMore);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPage(1);
    markAllNotificationsReadRequest().catch(() => {});
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
    <div className="max-w-lg mx-auto pt-4 sm:pt-8">
      <h1 className="text-xl font-semibold px-4 mb-4">Notifications</h1>

      {loading && notifications.length === 0 && (
        <div className="flex justify-center py-16">
          <Spinner size={26} />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <EmptyState icon={Heart} title="Activity On Your Posts" subtitle="When someone likes or comments on one of your posts, you'll see it here." />
      )}

      <div className="flex flex-col">
        {notifications.map((n) => (
          <NotificationItem key={n._id} notification={n} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />
      {loading && notifications.length > 0 && (
        <div className="flex justify-center py-6">
          <Spinner size={20} />
        </div>
      )}
    </div>
  );
}
