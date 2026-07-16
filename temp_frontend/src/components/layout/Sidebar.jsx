import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Compass,
  Clapperboard,
  Heart,
  PlusSquare,
  Menu,
  LogOut,
  Instagram,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import { cx } from '../../utils/helpers';
import { getUnreadCountRequest } from '../../api/notifications';

export default function Sidebar({ onCreateClick, onSearchClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const poll = () => {
      getUnreadCountRequest()
        .then((res) => mounted && setUnread(res.data.count))
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const linkClass = ({ isActive }) =>
    cx(
      'flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all duration-200 w-full text-left',
      isActive ? 'font-bold text-white bg-white/5' : 'text-white/80 hover:text-white'
    );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[72px] xl:w-64 border-r border-white/10 bg-black px-3 py-7 z-30 transition-all duration-300">
      <NavLink to="/" className="px-4 mb-8 hidden xl:block hover:opacity-90 transition-opacity">
        <span className="font-logo text-2xl tracking-wide bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">Instagram</span>
      </NavLink>
      <NavLink to="/" className="px-4 mb-8 xl:hidden flex justify-center hover:scale-105 active:scale-95 transition-transform text-white">
        <Instagram size={26} />
      </NavLink>

      <nav className="flex flex-col gap-1 flex-1">
        <NavLink to="/" end className={linkClass}>
          <Home size={26} />
          <span className="hidden xl:inline">Home</span>
        </NavLink>

        <button onClick={onSearchClick} className={linkClass({ isActive: false })}>
          <Search size={26} />
          <span className="hidden xl:inline">Search</span>
        </button>

        <NavLink to="/explore" className={linkClass}>
          <Compass size={26} />
          <span className="hidden xl:inline">Explore</span>
        </NavLink>

        <NavLink to="/reels" className={linkClass}>
          <Clapperboard size={26} />
          <span className="hidden xl:inline">Reels</span>
        </NavLink>

        <NavLink to="/notifications" className={linkClass}>
          <div className="relative">
            <Heart size={26} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-ig-red text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>
          <span className="hidden xl:inline">Notifications</span>
        </NavLink>

        <button onClick={onCreateClick} className={linkClass({ isActive: false })}>
          <PlusSquare size={26} />
          <span className="hidden xl:inline">Create</span>
        </button>

        <NavLink to={`/${user?.username}`} className={linkClass}>
          <Avatar user={user} size="xs" />
          <span className="hidden xl:inline">Profile</span>
        </NavLink>
      </nav>

      <div className="relative">
        {menuOpen && (
          <div className="absolute bottom-16 left-0 w-56 bg-ig-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn p-1 z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-white/5 active:bg-white/10 flex items-center gap-2.5 text-sm font-medium rounded-xl text-ig-red transition-all duration-200"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 active:scale-[0.98] w-full text-left transition-all duration-200"
        >
          <Menu size={26} />
          <span className="hidden xl:inline">More</span>
        </button>
      </div>
    </aside>
  );
}
