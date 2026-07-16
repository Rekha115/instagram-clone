import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Grid, Bookmark, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfileRequest } from '../api/users';
import { getUserPostsRequest } from '../api/posts';
import { getSavedPostsRequest } from '../api/users';
import Avatar from '../components/common/Avatar';
import { Spinner } from '../components/common/Loader';
import PostGrid from '../components/post/PostGrid';
import EmptyState from '../components/common/EmptyState';
import FollowButton from '../components/user/FollowButton';
import UserListModal from '../components/user/UserListModal';
import useAuth from '../hooks/useAuth';
import { cx } from '../utils/helpers';

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [listModal, setListModal] = useState(null); // 'followers' | 'following' | null

  const isMe = me?.username === username;

  const loadProfile = useCallback(() => {
    setLoading(true);
    setNotFound(false);
    getProfileRequest(username)
      .then((res) => setProfile(res.data.user))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else toast.error(err.friendlyMessage || 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    loadProfile();
    setTab('posts');
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;
    setPostsLoading(true);
    const request = tab === 'saved' ? getSavedPostsRequest() : getUserPostsRequest(username, { limit: 24 });
    request
      .then((res) => {
        setPosts(res.data.posts);
        setHasMore(res.data.hasMore);
      })
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [profile, tab, username]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (notFound) {
    return <EmptyState title="Sorry, this page isn't available." subtitle="The link you followed may be broken, or the page may have been removed." />;
  }

  if (!profile) return null;

  return (
    <div className="max-w-[935px] mx-auto pt-8 sm:pt-12 px-4 pb-16">
      <header className="flex flex-col sm:flex-row items-center gap-8 sm:gap-14 mb-10 pb-8 border-b border-white/5">
        <Avatar user={profile} size="2xl" ring className="hover:scale-102 transition-transform duration-300" />
        <div className="flex-1 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
            <h1 className="text-2xl font-light text-white tracking-wide">{profile.username}</h1>
            {isMe ? (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/accounts/edit')}
                  className="bg-ig-surface2/80 hover:bg-white/10 active:scale-[0.98] text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200 text-white"
                >
                  Edit profile
                </button>
                <button
                  onClick={() => navigate('/accounts/edit')}
                  className="bg-ig-surface2/80 hover:bg-white/10 p-2 rounded-xl active:scale-95 transition-all text-white"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
              </div>
            ) : (
              <FollowButton
                username={profile.username}
                isFollowing={profile.isFollowedByMe}
                onChange={(next) =>
                  setProfile((p) => ({
                    ...p,
                    followersCount: Math.max(0, p.followersCount + (next ? 1 : -1)),
                  }))
                }
              />
            )}
          </div>

          <div className="flex gap-8 mb-5 text-sm sm:text-base justify-center sm:justify-start">
            <span className="text-white/90">
              <strong className="text-white font-semibold">{posts.length}</strong>{hasMore && '+'} posts
            </span>
            <button onClick={() => setListModal('followers')} className="hover:text-white text-white/90 transition-colors">
              <strong className="text-white font-semibold">{profile.followersCount}</strong> followers
            </button>
            <button onClick={() => setListModal('following')} className="hover:text-white text-white/90 transition-colors">
              <strong className="text-white font-semibold">{profile.followingCount}</strong> following
            </button>
          </div>

          <div className="text-sm sm:text-base text-white/80">
            <p className="font-semibold text-white mb-1">{profile.fullName}</p>
            {profile.bio && <p className="whitespace-pre-line leading-relaxed mb-1.5">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-ig-blue hover:text-blue-400 font-semibold transition-colors inline-block"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="flex justify-center gap-12 mb-6">
        <button
          onClick={() => setTab('posts')}
          className={cx(
            'flex items-center gap-2 py-4 text-xs font-semibold tracking-widest uppercase border-t-2 -mt-[25px] transition-all duration-200',
            tab === 'posts' ? 'border-white text-white' : 'border-transparent text-ig-dim hover:text-white/80'
          )}
        >
          <Grid size={14} /> Posts
        </button>
        {isMe && (
          <button
            onClick={() => setTab('saved')}
            className={cx(
              'flex items-center gap-2 py-4 text-xs font-semibold tracking-widest uppercase border-t-2 -mt-[25px] transition-all duration-200',
              tab === 'saved' ? 'border-white text-white' : 'border-transparent text-ig-dim hover:text-white/80'
            )}
          >
            <Bookmark size={14} /> Saved
          </button>
        )}
      </div>

      {postsLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={24} />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={tab === 'saved' ? Bookmark : Grid}
          title={tab === 'saved' ? 'No saved posts yet' : isMe ? 'Share your first photo' : 'No posts yet'}
          subtitle={
            tab === 'saved'
              ? 'Save posts you want to see again.'
              : isMe
              ? 'When you share photos, they will appear on your profile.'
              : undefined
          }
        />
      ) : (
        <div className="mt-4">
          <PostGrid posts={posts} />
        </div>
      )}

      <UserListModal
        open={!!listModal}
        onClose={() => setListModal(null)}
        username={username}
        mode={listModal}
      />
    </div>
  );
}
