import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { Spinner } from '../components/common/Loader';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      const dest = location.state?.from?.pathname || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm">
        <div className="border border-white/10 bg-ig-surface/40 backdrop-blur-md rounded-2xl px-8 py-10 flex flex-col items-center shadow-2xl">
          <h1 className="font-logo text-4xl mb-8 tracking-wide text-white">Instagram</h1>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or email"
              autoComplete="username"
              className="bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white placeholder:text-ig-dim"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white placeholder:text-ig-dim"
            />
            <button
              type="submit"
              disabled={loading || !identifier.trim() || !password}
              className="mt-2 bg-ig-blue hover:bg-blue-600 active:scale-95 disabled:opacity-40 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading && <Spinner size={14} />}
              Log in
            </button>
          </form>

          <div className="flex items-center gap-3 w-full my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-ig-dim text-xs font-semibold tracking-wider">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <p className="text-sm text-ig-dim text-center">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-ig-blue hover:text-blue-400 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
