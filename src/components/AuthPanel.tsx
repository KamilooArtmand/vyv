import React, { useState } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { X, Check, LogOut, UserCheck, UserPlus, Sparkles } from 'lucide-react';

interface AuthPanelProps {
  user: User | null;
  onClose: () => void;
  onUserChange: (user: User | null) => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ user, onClose, onUserChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editHandle, setEditHandle] = useState(user?.handle || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
  const [editCoverUrl, setEditCoverUrl] = useState(user?.coverUrl || '');
  const [isFollowing, setIsFollowing] = useState(false);

  const handleOAuthLogin = async (provider: 'Google' | 'Facebook') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await AuthService.loginWithOAuth(provider);
      onUserChange(AuthService.getCurrentUser());
    } catch {
      setErrorMessage('External authentication service failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    const ok = await AuthService.loginWithEmail(email, password);
    if (ok) {
      onUserChange(AuthService.getCurrentUser());
    } else {
      setErrorMessage('Incorrect email or password.');
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setErrorMessage('Please provide an email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    const username = email.split('@')[0] || 'User';
    const ok = await AuthService.registerWithEmail(username, email, password);
    if (ok) {
      onUserChange(AuthService.getCurrentUser());
    } else {
      setErrorMessage('Failed to register account.');
    }
    setIsLoading(false);
  };

  const handleToggleEdit = () => {
    if (!isEditing && user) {
      setEditUsername(user.username);
      setEditHandle(user.handle);
      setEditBio(user.bio);
      setEditAvatarUrl(user.avatarUrl);
      setEditCoverUrl(user.coverUrl);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    AuthService.updateUserProfile(editUsername, editHandle, editBio, editAvatarUrl, editCoverUrl);
    onUserChange(AuthService.getCurrentUser());
    setIsEditing(false);
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    AuthService.toggleFollow();
    onUserChange(AuthService.getCurrentUser());
  };

  const handleLogout = () => {
    AuthService.logout();
    onUserChange(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn"
      onClick={() => {
        if (!isEditing) onClose();
      }}
      dir="ltr"
    >
      {!user ? (
        // Login / Register Modal
        <div
          className="w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-amber-500 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-red-500/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
            <p className="text-sm text-zinc-400 mt-1">Welcome to VYV Liquid Glass Music</p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-zinc-300">
              <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <span>Authenticating... ⏳</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('Google')}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition flex items-center justify-center gap-3 shadow"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('Facebook')}
                className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-sm transition flex items-center justify-center gap-3 shadow"
              >
                Continue with Facebook
              </button>

              <div className="relative my-2 text-center text-xs text-zinc-500">
                <span className="bg-zinc-900 px-3 relative z-10">or with email</span>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/10"></div>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address (user@example.com)"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500/50 transition"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500/50 transition"
              />

              {errorMessage && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-center">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleEmailLogin}
                className="w-full mt-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition shadow-lg shadow-red-600/20"
              >
                Sign In with Email
              </button>

              <button
                type="button"
                onClick={handleRegister}
                className="w-full py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-zinc-300 font-medium text-sm transition"
              >
                Create New Account
              </button>
            </div>
          )}
        </div>
      ) : (
        // Profile Display / Edit Modal
        <div
          className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white/80 hover:text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition"
          >
            <X size={18} />
          </button>

          {/* Cover Header */}
          <div
            className="h-36 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${user.coverUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30"></div>
            <button
              onClick={handleToggleEdit}
              className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-xs text-white backdrop-blur transition"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile ✏️'}
            </button>
          </div>

          {/* Profile Body */}
          <div className="px-6 pb-6 pt-0 text-center relative">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-24 h-24 rounded-full border-4 border-zinc-900 -mt-12 mx-auto object-cover bg-zinc-800 shadow-xl"
            />

            {isEditing ? (
              <div className="flex flex-col gap-3 text-left mt-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Display Name:</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">User Handle (@handle):</label>
                  <input
                    type="text"
                    value={editHandle}
                    onChange={(e) => setEditHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Biography:</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Avatar Image URL:</label>
                  <input
                    type="text"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Cover Photo URL:</label>
                  <input
                    type="text"
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="w-full mt-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <h3 className="text-xl font-bold text-white">{user.username}</h3>
                <p className="text-xs text-red-400 font-mono mt-0.5">
                  {user.handle}
                </p>
                <p className="text-sm text-zinc-400 mt-2 px-4 leading-relaxed">{user.bio}</p>

                {/* Stats badge */}
                <div className="grid grid-cols-3 gap-2 my-5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <div>
                    <div className="text-base font-bold text-white">{user.followersCount}</div>
                    <div className="text-[11px] text-zinc-400">Followers</div>
                  </div>
                  <div className="border-x border-white/10">
                    <div className="text-base font-bold text-white">{user.followingCount}</div>
                    <div className="text-[11px] text-zinc-400">Following</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-amber-400">PRO ✨</div>
                    <div className="text-[11px] text-zinc-400">Member Status</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                      isFollowing
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                        : 'bg-white text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={16} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} /> Follow +
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
