import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchUsersRequest } from '../../api/users';
import Avatar from '../common/Avatar';
import { Spinner } from '../common/Loader';

export default function SearchPanel({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      searchUsersRequest(q, { limit: 20 })
        .then((res) => setResults(res.data.users))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 animate-fadeIn" onClick={onClose} />
      <div className="fixed left-0 md:left-[72px] xl:left-64 top-0 h-full w-full sm:w-[400px] bg-ig-surface border-r border-white/10 z-40 flex flex-col animate-slideUp">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold mb-4 text-white">Search</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ig-dim" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg py-2.5 pl-9 pr-9 text-sm outline-none transition-all duration-200"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-dim hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {loading && (
            <div className="flex justify-center py-6">
              <Spinner size={22} />
            </div>
          )}
          {!loading && query && results.length === 0 && (
            <p className="text-center text-ig-dim text-sm py-6">No results found.</p>
          )}
          {results.map((u) => (
            <Link
              key={u._id}
              to={`/${u.username}`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all duration-200"
            >
              <Avatar user={u} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{u.username}</p>
                <p className="text-sm text-ig-dim truncate">{u.fullName}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
