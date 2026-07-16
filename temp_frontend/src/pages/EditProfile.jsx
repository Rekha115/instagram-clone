import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import { Spinner } from '../components/common/Loader';
import { updateProfileRequest, updateAvatarRequest } from '../api/users';

const GENDERS = [
  { value: '', label: 'Prefer not to say / not set' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    website: user?.website || '',
    gender: user?.gender || '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await updateAvatarRequest(file);
      updateUser(res.data.user);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to update profile picture');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfileRequest(form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
      navigate(`/${res.data.user.username}`);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-6 sm:pt-10 px-4 pb-16">
      <div className="flex items-center gap-3 mb-6 sm:hidden">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-semibold">Edit profile</h1>
      </div>
      <h1 className="hidden sm:block text-xl font-semibold mb-6">Edit profile</h1>

      <div className="flex items-center gap-4 bg-ig-surface rounded-lg p-4 mb-6">
        <Avatar user={user} size="lg" />
        <div>
          <p className="font-semibold text-sm">{user?.username}</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={avatarUploading}
            className="text-ig-blue text-sm font-semibold flex items-center gap-2"
          >
            {avatarUploading && <Spinner size={12} />}
            Change photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-ig-surface/40 border border-white/5 p-6 rounded-2xl shadow-xl">
        <div>
          <label className="text-sm text-ig-dim block mb-1 font-medium">Username</label>
          <input
            value={form.username}
            onChange={update('username')}
            maxLength={30}
            className="w-full bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white"
          />
        </div>

        <div>
          <label className="text-sm text-ig-dim block mb-1 font-medium">Full name</label>
          <input
            value={form.fullName}
            onChange={update('fullName')}
            maxLength={50}
            className="w-full bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white"
          />
        </div>

        <div>
          <label className="text-sm text-ig-dim block mb-1 font-medium">Bio</label>
          <textarea
            value={form.bio}
            onChange={update('bio')}
            maxLength={150}
            rows={3}
            className="w-full bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white resize-none"
          />
          <p className="text-xs text-ig-dim text-right mt-1.5">{form.bio.length}/150</p>
        </div>

        <div>
          <label className="text-sm text-ig-dim block mb-1 font-medium">Website</label>
          <input
            value={form.website}
            onChange={update('website')}
            maxLength={100}
            placeholder="yourwebsite.com"
            className="w-full bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white placeholder:text-ig-dim"
          />
        </div>

        <div>
          <label className="text-sm text-ig-dim block mb-1 font-medium">Gender</label>
          <select
            value={form.gender}
            onChange={update('gender')}
            className="w-full bg-ig-surface2/60 border border-white/5 focus:border-white/20 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 text-white"
          >
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value} className="bg-ig-surface">
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="self-start mt-2 bg-ig-blue hover:bg-blue-600 active:scale-95 disabled:opacity-40 text-white font-semibold rounded-xl px-6 py-2.5 text-sm flex items-center gap-2 transition-all duration-200"
        >
          {saving && <Spinner size={14} />}
          Submit
        </button>
      </form>
    </div>
  );
}
