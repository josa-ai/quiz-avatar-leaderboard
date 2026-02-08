import React, { useState } from 'react';
import { User, TeamMember } from '@/types/game';
import AIHost from './AIHost';

interface HomePageProps {
  user: User;
  onStartGame: (mode: 'solo' | 'vs', teamMembers: TeamMember[]) => void;
  onViewLeaderboard: () => void;
  onViewRewards: () => void;
  onViewPractice: () => void;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  user, 
  onStartGame, 
  onViewLeaderboard, 
  onViewRewards,
  onViewPractice,
  onLogout 
}) => {
  const [selectedMode, setSelectedMode] = useState<'solo' | 'vs' | null>(null);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  const handleModeSelect = (mode: 'solo' | 'vs') => {
    setSelectedMode(mode);
    setShowTeamSetup(true);
  };

  const addTeamMember = () => {
    if (newMemberName.trim() && teamMembers.length < 10) {
      setTeamMembers([
        ...teamMembers,
        {
          id: Date.now().toString(),
          name: newMemberName.trim(),
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face&seed=${teamMembers.length}`
        }
      ]);
      setNewMemberName('');
    }
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleStartGame = () => {
    if (selectedMode) {
      onStartGame(selectedMode, teamMembers);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400">
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold">{user.username}</p>
              <p className="text-cyan-400 text-sm">{user.points} Points | Rank #{user.rank}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </header>

        {/* AI Host Welcome */}
        <div className="mb-8">
          <AIHost messageType="welcome" size="large" />
        </div>

        {!showTeamSetup ? (
          <>
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4">
                FINAL EXAM
              </h1>
              <p className="text-xl text-slate-300">Choose Your Challenge</p>
            </div>

            {/* Game Mode Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Solo Mode */}
              <button
                onClick={() => handleModeSelect('solo')}
                className="group relative bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">SOLO CHALLENGE</h3>
                  <p className="text-slate-400">Test your knowledge alone and climb the global rankings!</p>
                </div>
              </button>

              {/* VS Mode */}
              <button
                onClick={() => handleModeSelect('vs')}
                className="group relative bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-purple-400/50 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">VS MODE</h3>
                  <p className="text-slate-400">Challenge another player in a head-to-head battle!</p>
                </div>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <button
                onClick={onViewLeaderboard}
                className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-yellow-400/50 transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-white font-semibold">Leaderboard</span>
              </button>

              <button
                onClick={onViewRewards}
                className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-green-400/50 transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white font-semibold">Rewards</span>
              </button>

              {/* Practice Mode Button */}
              <button
                onClick={onViewPractice}
                className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-400/50 transition-all text-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold">Practice</span>
                </div>
                {/* New badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-xs font-bold text-white">
                  NEW
                </div>
              </button>

              <button className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-blue-400/50 transition-all text-center group">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-white font-semibold">History</span>
              </button>

              <button className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-pink-400/50 transition-all text-center group">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-white font-semibold">Settings</span>
              </button>
            </div>

            {/* Game Info Cards */}
            <div className="mt-12 grid md:grid-cols-4 gap-4">
              <div className="bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">1</span>
                  </div>
                  <h4 className="text-white font-semibold">True/False</h4>
                </div>
                <p className="text-slate-400 text-sm">5 min speed round</p>
              </div>
              <div className="bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <h4 className="text-white font-semibold">Escape Room</h4>
                </div>
                <p className="text-slate-400 text-sm">Math puzzles, 10 min</p>
              </div>
              <div className="bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <span className="text-pink-400 font-bold">3</span>
                  </div>
                  <h4 className="text-white font-semibold">Game Board</h4>
                </div>
                <p className="text-slate-400 text-sm">Categories & traps</p>
              </div>
              <div className="bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 font-bold">4</span>
                  </div>
                  <h4 className="text-white font-semibold">Team Round</h4>
                </div>
                <p className="text-slate-400 text-sm">5 min team challenge</p>
              </div>
            </div>
          </>
        ) : (
          /* Team Setup */
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedMode === 'solo' ? 'Solo Challenge' : 'VS Mode'} - Team Setup
              </h2>
              <p className="text-slate-400 mb-6">Add team members for Round 4 (optional, up to 10)</p>

              {/* Add member input */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                  placeholder="Team member name"
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={addTeamMember}
                  disabled={teamMembers.length >= 10}
                  className="px-6 py-3 bg-cyan-500 rounded-xl font-semibold text-white hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {/* Team members list */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {teamMembers.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No team members added yet</p>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between bg-slate-700/50 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {member.name[0].toUpperCase()}
                        </div>
                        <span className="text-white">{member.name}</span>
                      </div>
                      <button
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowTeamSetup(false)}
                  className="flex-1 py-4 bg-slate-700 rounded-xl font-semibold text-white hover:bg-slate-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStartGame}
                  className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                >
                  START GAME
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
