import { NavLink } from 'react-router-dom';
import { Home, Search, PlusSquare, Clapperboard, Heart } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import { cx } from '../../utils/helpers';

export default function MobileNav({ onCreateClick, onSearchClick }) {
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    cx('flex items-center justify-center flex-1 py-3 transition-all duration-200 active:scale-90', isActive && 'text-white', !isActive && 'text-white/60 hover:text-white/80');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-black/95 backdrop-blur-md border-t border-white/10 flex items-center z-30">
      <NavLink to="/" end className={linkClass}>
        <Home size={24} />
      </NavLink>
      <button onClick={onSearchClick} className="flex items-center justify-center flex-1 py-3 text-white/70">
        <Search size={24} />
      </button>
      <button onClick={onCreateClick} className="flex items-center justify-center flex-1 py-3 text-white/70">
        <PlusSquare size={24} />
      </button>
      <NavLink to="/reels" className={linkClass}>
        <Clapperboard size={24} />
      </NavLink>
      <NavLink to="/notifications" className={linkClass}>
        <Heart size={24} />
      </NavLink>
      <NavLink to={`/${user?.username}`} className="flex items-center justify-center flex-1 py-2">
        <Avatar user={user} size="xs" />
      </NavLink>
    </nav>
  );
}
