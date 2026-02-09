import React, { useState, useEffect } from 'react';
import { User, GameSessionRecord, RoundResult } from '@/types/game';
import { getGameHistory } from '@/lib/gameService';

interface HistoryPageProps {
  user: User;
  onBack: () => void;
  onViewChallenge?: (challengeId: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ user, onBack, onViewChallenge }) => {
  const [sessions, setSessions] = useState<GameSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (loadOffset = 0) => {
    setLoading(true);
    const result = await getGameHistory(user.id, PAGE_SIZE, loadOffset);
    if (result.data) {
      if (loadOffset === 0) {
        setSessions(result.data);
      } else {
        setSessions(prev => [...prev, ...result.data!]);
      }
      setHasMore(result.data.length === PAGE_SIZE);
    }
    setLoading(false);
  };

  const loadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    loadHistory(newOffset);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getModeBadge = (session: GameSessionRecord) => {
    if (session.challenge_id) return { label: 'Challenge', color: 'bg-purple-500' };
    if (session.game_mode === 'vs') return { label: 'VS', color: 'bg-pink-500' };
    return { label: 'Solo', color: 'bg-cyan-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
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
          <h1 className="text-3xl font-bold text-white">Game History</h1>
        </div>

        {/* Sessions list */}
        {loading && sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400">No games played yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const badge = getModeBadge(session);
              const isExpanded = expandedId === session.id;
              return (
                <div
                  key={session.id}
                  className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{session.total_score}</p>
                        <p className="text-xs text-slate-500">pts</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${badge.color}`}>
                            {badge.label}
                          </span>
                          {session.is_winner && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-yellow-300 bg-yellow-500/20">
                              WIN
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">{formatDate(session.created_at)}</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-700/50">
                      <div className="pt-3 space-y-2">
                        {(session.round_results || []).map((r: RoundResult, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Round {r.round}</span>
                            <span className="text-white font-medium">{r.score} pts</span>
                            <span className="text-slate-500 text-xs">{r.details}</span>
                          </div>
                        ))}
                      </div>
                      {session.challenge_id && onViewChallenge && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewChallenge(session.challenge_id!);
                          }}
                          className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View Challenge →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 bg-slate-800/60 rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
