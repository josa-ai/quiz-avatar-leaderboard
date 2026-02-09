import React, { useState, useEffect } from 'react';
import { User, Challenge } from '@/types/game';
import { getChallenges } from '@/lib/gameService';

interface ChallengeListPageProps {
  user: User;
  onViewChallenge: (challengeId: string) => void;
  onBack: () => void;
}

type TabKey = 'active' | 'completed' | 'pending';

const ChallengeListPage: React.FC<ChallengeListPageProps> = ({ user, onViewChallenge, onBack }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('active');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    const result = await getChallenges();
    if (result.data) {
      setChallenges(result.data);
    }
    setLoading(false);
  };

  const filtered = challenges.filter(c => {
    if (tab === 'active') return c.status === 'active';
    if (tab === 'completed') return c.status === 'completed';
    return c.status === 'pending';
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'pending', label: 'Pending' },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOpponentName = (c: Challenge) => {
    if (c.challenger_id === user.id) return c.opponent_username || 'Waiting...';
    return c.challenger_username || 'Unknown';
  };

  const getMyScore = (c: Challenge) => {
    return c.challenger_id === user.id ? c.challenger_score : c.opponent_score;
  };

  const getTheirScore = (c: Challenge) => {
    return c.challenger_id === user.id ? c.opponent_score : c.challenger_score;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-white">My Challenges</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                tab === t.key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
              <span className="ml-1 opacity-60">
                ({challenges.filter(c => {
                  if (t.key === 'active') return c.status === 'active';
                  if (t.key === 'completed') return c.status === 'completed';
                  return c.status === 'pending';
                }).length})
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading challenges...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400">No {tab} challenges</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => onViewChallenge(c.id)}
                className="w-full bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 hover:border-cyan-400/30 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold">
                      {getOpponentName(c)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">vs {getOpponentName(c)}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">{formatDate(c.created_at)}</span>
                        <span className="font-mono text-xs text-slate-600">{c.challenge_code}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {c.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{getMyScore(c)}</span>
                        <span className="text-slate-500">—</span>
                        <span className="text-purple-400 font-bold">{getTheirScore(c)}</span>
                      </div>
                    ) : c.status === 'active' ? (
                      <span className="text-amber-400 text-sm">In Progress</span>
                    ) : (
                      <span className="text-slate-500 text-sm">Pending</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeListPage;
