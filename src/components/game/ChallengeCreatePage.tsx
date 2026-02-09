import React, { useState } from 'react';
import { Challenge, TeamMember } from '@/types/game';

interface ChallengeCreatePageProps {
  challenge: Challenge;
  onStartPlaying: (teamMembers: TeamMember[]) => void;
  onBack: () => void;
}

const ChallengeCreatePage: React.FC<ChallengeCreatePageProps> = ({ challenge, onStartPlaying, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  const copyCode = () => {
    navigator.clipboard.writeText(challenge.challenge_code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addTeamMember = () => {
    if (newMemberName.trim() && teamMembers.length < 10) {
      setTeamMembers([...teamMembers, {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        avatar: ''
      }]);
      setNewMemberName('');
    }
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Challenge Created!</h2>
          <p className="text-slate-400 mb-6">Share this code with your opponent</p>

          {/* Challenge Code */}
          <button
            onClick={copyCode}
            className="w-full bg-slate-700/50 rounded-2xl p-6 mb-4 border-2 border-dashed border-slate-600 hover:border-cyan-400/50 transition-all group"
          >
            <p className="text-4xl font-mono font-black text-cyan-400 tracking-[0.3em] mb-2">
              {challenge.challenge_code}
            </p>
            <p className="text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">
              {copied ? 'Copied!' : 'Tap to copy'}
            </p>
          </button>

          {/* Team Setup (optional) */}
          <div className="text-left mb-6">
            <p className="text-slate-400 text-sm mb-3">Add team members for Round 4 (optional)</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                placeholder="Team member name"
                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={addTeamMember}
                disabled={teamMembers.length >= 10}
                className="px-4 py-2 bg-cyan-500 rounded-xl text-sm font-semibold text-white hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {teamMembers.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {teamMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {m.name[0].toUpperCase()}
                      </div>
                      <span className="text-white text-sm">{m.name}</span>
                    </div>
                    <button onClick={() => removeTeamMember(m.id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onStartPlaying(teamMembers)}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all mb-3"
          >
            START PLAYING
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCreatePage;
