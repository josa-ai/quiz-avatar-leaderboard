import React, { useState } from 'react';
import { User } from '@/types/game';
import { updateProfile } from '@/lib/gameService';
import { avatarPresets } from '@/data/avatarPresets';

interface SettingsPageProps {
  user: User;
  onBack: () => void;
  onUserUpdate: (user: User) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack, onUserUpdate }) => {
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem('finalexam_audio_muted') === 'true'; } catch { return false; }
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    try { localStorage.setItem('finalexam_audio_muted', String(next)); } catch {}
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (user.id.startsWith('demo-')) return;
    setSavingAvatar(true);
    const result = await updateProfile(user.id, avatarUrl);
    if (result.data) {
      onUserUpdate(result.data);
    }
    setSavingAvatar(false);
    setShowAvatarPicker(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-4">
          <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="relative group"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400">
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </button>
            <div>
              <p className="text-white font-semibold text-lg">{user.username}</p>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Avatar Picker */}
          {showAvatarPicker && (
            <div className="mt-4 p-4 bg-slate-700/50 rounded-xl">
              <p className="text-slate-300 text-sm mb-3">Choose a new avatar:</p>
              <div className="grid grid-cols-6 gap-3">
                {avatarPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleAvatarSelect(preset.url)}
                    disabled={savingAvatar}
                    className={`relative rounded-full overflow-hidden border-2 transition-all ${
                      user.avatar === preset.url
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                        : 'border-slate-600 hover:border-slate-400'
                    } disabled:opacity-50`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
              {savingAvatar && (
                <p className="text-cyan-400 text-sm mt-2 text-center">Saving...</p>
              )}
            </div>
          )}
        </div>

        {/* Audio Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-4">
          <h2 className="text-lg font-semibold text-white mb-4">Audio</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">AI Host Voice</p>
              <p className="text-slate-400 text-sm">Toggle the AI host audio during gameplay</p>
            </div>
            <button
              onClick={toggleMute}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isMuted ? 'bg-slate-600' : 'bg-cyan-500'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  isMuted ? 'left-0.5' : 'left-7'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">{user.points}</p>
              <p className="text-slate-400 text-sm">Total Points</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{user.gamesPlayed}</p>
              <p className="text-slate-400 text-sm">Games Played</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{user.wins}</p>
              <p className="text-slate-400 text-sm">Wins</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">#{user.rank}</p>
              <p className="text-slate-400 text-sm">Rank</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
