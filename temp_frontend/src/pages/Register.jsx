import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { checkUsernameRequest } from '../api/auth';
import { Spinner } from '../components/common/Loader';

const USERNAME_RE = /^[a-z0-9._]+$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'

  useEffect(() => {
    const username = form.username.trim().toLowerCase();
    if (!username) {
      setUsernameStatus(null);
      return;
    }
    if (username.length < 3 || username.length > 30 || !USERNAME_RE.test(username)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    const timeout = setTimeout(() => {
      checkUsernameRequest(username)
        .then((res) => setUsernameStatus(res.data.available ? 'available' : 'taken'))
        .catch(() => setUsernameStatus(null));
    }, 400);
    return () => clearTimeout(timeout);
  }, [form.username]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const passwordValid = form.password.length >= 8 && /\d/.test(form.password);
  const canSubmit =
    form.username.trim() &&
    form.fullName.trim() &&
    form.email.trim() &&
    passwordValid &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'invalid';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      await register({
        username: form.username.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black py-10">
      <div className="w-full max-w-sm">
        <div className="border border-white/10 bg-ig-surface/40 backdrop-blur-md rounded-2xl px-8 py-10 flex flex-col items-center shadow-2xl">
          <h1 className="font-logo text-4xl mb-2 tracking-wide text-white">Instagram</h1>
          <p className="text-ig-dim text-center text-sm mb-6 max-w-[240px]">
            Sign up to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              value={form.fullName}
              onChange={update('fullName')}
              placeholder="Full name"
              maxLength={50}
              className="bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white placeholder:text-ig-dim"
            />
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="Email"
              className="bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white placeholder:text-ig-dim"
            />
            <div className="relative">
              <input
                value={form.username}
                onChange={update('username')}
                placeholder="Username"
                maxLength={30}
                className="w-full bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 pr-8 text-sm outline-none transition-all duration-200 text-white placeholder:text-ig-dim"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Spinner size={14} />}
                {usernameStatus === 'available' && <Check size={16} className="text-green-500" />}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                  <X size={16} className="text-ig-red" />
                )}
              </span>
            </div>
            {usernameStatus === 'taken' && (
              <p className="text-xs text-ig-red -mt-1.5 px-1">This username is already taken.</p>
            )}
            {usernameStatus === 'invalid' && form.username && (
              <p className="text-xs text-ig-red -mt-1.5 px-1 leading-relaxed">
                3-30 characters: lowercase, numbers, dots, and underscores only.
              </p>
            )}
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="Password"
              className="bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white placeholder:text-ig-dim"
            />
            {form.password && !passwordValid && (
              <p className="text-xs text-ig-dim -mt-1.5 px-1 leading-relaxed">
                At least 8 characters, including one number.
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="mt-2 bg-ig-blue hover:bg-blue-600 active:scale-95 disabled:opacity-40 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading && <Spinner size={14} />}
              Sign up
            </button>
          </form>
        </div>

        <div className="border border-white/10 rounded-2xl py-4 mt-4 text-center text-sm bg-ig-surface/20 backdrop-blur-md">
          Have an account?{' '}
          <Link to="/login" className="text-ig-blue hover:text-blue-400 font-semibold transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
