import { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { User, Camera, Save } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const resolveAvatar = (avatarUrl) => {
  if (!avatarUrl) return '';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${API_BASE}${avatarUrl}`;
};

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            Profile
          </h1>
          <p className="font-light mt-0.5" style={{ color: '#000', fontSize: '0.82em', opacity: 0.8 }}>
            Update your name and profile photo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Profile photo</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>JPG/PNG/WebP up to 3MB</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
            >
              {currentAvatar ? (
                <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
              )}
            </div>

            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePickAvatar(e.target.files?.[0])}
                className="block w-full text-xs"
                style={{ color: 'var(--text-secondary)' }}
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleUploadAvatar}
                  disabled={!avatarFile || uploading}
                  className="btn-primary px-4 py-2 text-xs disabled:opacity-60"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {avatarFile && (
                  <button
                    type="button"
                    onClick={() => { setAvatarFile(null); setAvatarPreview(''); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Account details</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Basic info used across the app</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Full name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base"
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Email
                </label>
                <input value={user?.email || ''} disabled className="input-base opacity-70 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Role
                </label>
                <input value={user?.role || ''} disabled className="input-base opacity-70 cursor-not-allowed" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60 flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

