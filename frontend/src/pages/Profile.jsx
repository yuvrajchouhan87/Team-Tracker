import { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { User, Camera, Save, Shield, Mail, Check } from 'lucide-react';

const API_BASE = 'https://team-tracker-dbzf.onrender.com';

const resolveAvatar = (avatarUrl) => {
  if (!avatarUrl) return '';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${API_BASE}${avatarUrl}`;
};

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const currentAvatar = useMemo(() => {
    return avatarPreview || resolveAvatar(user?.avatarUrl);
  }, [avatarPreview, user?.avatarUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await axios.put(`${API_BASE}/api/users/me`, { name });
      updateUser({ name: data.name });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = (file) => {
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append('avatar', avatarFile);
      const { data } = await axios.post(`${API_BASE}/api/users/me/avatar`, form);
      updateUser({ avatarUrl: data.avatarUrl });
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal details and public profile avatar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
              {currentAvatar ? (
                <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-105">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePickAvatar(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block">{user?.role}</span>

          {avatarFile && (
            <div className="flex gap-2 mt-4 w-full">
              <button
                type="button"
                onClick={handleUploadAvatar}
                disabled={uploading}
                className="btn-primary flex-1 py-1.5 text-xs font-semibold"
              >
                {uploading ? 'Uploading...' : 'Save Photo'}
              </button>
              <button
                type="button"
                onClick={() => { setAvatarFile(null); setAvatarPreview(''); }}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Details Form */}
        <div className="card p-6 md:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Personal Information
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base text-xs py-2.5"
                placeholder="Your name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={user?.email || ''}
                    disabled
                    className="input-base text-xs py-2.5 pl-9 bg-slate-50 dark:bg-slate-800/60 opacity-70 cursor-not-allowed text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned Role
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={user?.role || ''}
                    disabled
                    className="input-base text-xs py-2.5 pl-9 bg-slate-50 dark:bg-slate-800/60 opacity-70 cursor-not-allowed text-slate-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Changes saved
                </span>
              ) : <div />}

              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2 px-4 text-xs font-semibold"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
