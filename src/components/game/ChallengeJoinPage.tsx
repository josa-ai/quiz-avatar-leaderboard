import React, { useState } from 'react';
import { User, TeamMember, Challenge } from '@/types/game';
import { joinChallenge } from '@/lib/gameService';

interface ChallengeJoinPageProps {
  user: User;
  onChallengeJoined: (challenge: Challenge) => void;
  onStartPlaying: (teamMembers: TeamMember[]) => void;
  onBack: () => void;
}

const ChallengeJoinPage: React.FC<ChallengeJoinPageProps> = ({ user, onChallengeJoined, onStartPlaying, onBack }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Code must be 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const result = await joinChallenge(trimmed);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.data) {
      onChallengeJoined(result.data);
      setJoined(true);
    }
    setLoading(false);
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join Challenge</h2>
          <p className="text-slate-400 mb-6">Enter the 6-character code from your opponent</p>

          {!joined ? (
            <>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().slice(0, 6));
                  setError('');
                }}
                placeholder="ABCDEF"
                maxLength={6}
                className="w-full px-6 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-2xl text-3xl font-mono font-bold text-center text-cyan-400 tracking-[0.3em] placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-4"
              />

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <button
                onClick={handleJoin}
                disabled={code.length !== 6 || loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 mb-3"
              >
                {loading ? 'Joining...' : 'JOIN CHALLENGE'}
              </button>
            </>
          ) : (
            <>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <p className="text-green-400 font-semibold">Challenge joined!</p>
                <p className="text-slate-400 text-sm mt-1">You'll play the same questions as your opponent</p>
              </div>

              {/* Team Setup */}
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
                    className="px-4 py-2 bg-cyan-500 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
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
            </>
          )}

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

export default ChallengeJoinPage;
