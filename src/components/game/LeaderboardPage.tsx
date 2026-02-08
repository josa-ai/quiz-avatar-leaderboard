import React, { useState, useEffect } from 'react';
import { User, LeaderboardEntry } from '@/types/game';
import { getLeaderboard, subscribeToLeaderboard } from '@/lib/gameService';

interface LeaderboardPageProps {
  currentUser: User;
  onBack: () => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ currentUser, onBack }) => {
  const [filter, setFilter] = useState<'all_time' | 'weekly'>('all_time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const result = await getLeaderboard(filter, 100);
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setLeaderboard(result.data);
          setLastUpdate(new Date());
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((entries) => {
      setLeaderboard(entries);
      setLastUpdate(new Date());
    });

    return () => unsubscribe();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { color: 'bg-yellow-500', icon: '1st' };
    if (rank === 2) return { color: 'bg-slate-400', icon: '2nd' };
    if (rank === 3) return { color: 'bg-amber-600', icon: '3rd' };
    return { color: 'bg-slate-700', icon: rank.toString() };
  };

  const getRankTier = (rank: number) => {
    if (rank <= 10) return { tier: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    if (rank <= 50) return { tier: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (rank <= 100) return { tier: 'Silver', color: 'text-slate-300', bg: 'bg-slate-500/20' };
    return { tier: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-500/20' };
  };

  const userTier = getRankTier(currentUser.rank);

  // Find current user's position in leaderboard
  const userPosition = leaderboard.findIndex(e => e.user.id === currentUser.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              LEADERBOARD
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="w-20"></div>
        </div>

        {/* Real-time indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Live Updates</span>
        </div>

        {/* Current user rank card */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl p-6 border border-cyan-400/30 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400">
                <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${userTier.bg} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${userTier.color}`}>#{currentUser.rank}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg">{currentUser.username}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${userTier.bg} ${userTier.color}`}>
                  {userTier.tier}
                </span>
                <span className="text-slate-400 text-sm">{currentUser.points.toLocaleString()} points</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-cyan-400">
                {currentUser.gamesPlayed > 0 
                  ? Math.round((currentUser.wins / currentUser.gamesPlayed) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex bg-slate-800/50 rounded-xl p-1">
            {(['all_time', 'weekly'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all_time' ? 'All Time' : 'Weekly'}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-cyan-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Top 3 podium */}
        {!isLoading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Second place */}
            <div className="order-1 pt-8">
              <div className="bg-slate-800/80 rounded-2xl p-4 text-center border-2 border-slate-400">
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-slate-400 mb-2">
                  <img src={leaderboard[1].user.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 mx-auto -mt-4 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <p className="text-white font-bold mt-2 truncate">{leaderboard[1].user.username}</p>
                <p className="text-slate-400 text-sm">{leaderboard[1].score.toLocaleString()}</p>
              </div>
            </div>

            {/* First place */}
            <div className="order-2">
              <div className="bg-gradient-to-b from-yellow-500/20 to-slate-800/80 rounded-2xl p-4 text-center border-2 border-yellow-500">
                <svg className="w-8 h-8 mx-auto text-yellow-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-yellow-500 mb-2">
                  <img src={leaderboard[0].user.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-10 mx-auto -mt-5 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <p className="text-white font-bold text-lg mt-2 truncate">{leaderboard[0].user.username}</p>
                <p className="text-yellow-400 font-semibold">{leaderboard[0].score.toLocaleString()}</p>
              </div>
            </div>

            {/* Third place */}
            <div className="order-3 pt-12">
              <div className="bg-slate-800/80 rounded-2xl p-4 text-center border-2 border-amber-600">
                <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-amber-600 mb-2">
                  <img src={leaderboard[2].user.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="w-7 h-7 mx-auto -mt-3 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <p className="text-white font-bold mt-2 truncate text-sm">{leaderboard[2].user.username}</p>
                <p className="text-slate-400 text-sm">{leaderboard[2].score.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard list */}
        {!isLoading && leaderboard.length > 3 && (
          <div className="bg-slate-800/50 rounded-2xl overflow-hidden">
            {leaderboard.slice(3).map((entry, index) => {
              const badge = getRankBadge(entry.rank);
              const isCurrentUser = entry.user.id === currentUser.id;
              
              return (
                <div 
                  key={entry.user.id}
                  className={`flex items-center gap-4 p-4 ${
                    index !== leaderboard.length - 4 ? 'border-b border-slate-700/50' : ''
                  } ${isCurrentUser ? 'bg-cyan-500/10' : 'hover:bg-slate-700/30'} transition-colors`}
                >
                  <div className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center text-white font-bold`}>
                    {entry.rank}
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600">
                    <img src={entry.user.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
                      {entry.user.username}
                      {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                    </p>
                    <p className="text-slate-400 text-sm">{entry.user.gamesPlayed} games</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold">{entry.score.toLocaleString()}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && leaderboard.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-slate-400">No scores yet. Be the first to play!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
