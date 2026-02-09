import React from 'react';
import { Challenge, RoundResult } from '@/types/game';

interface ChallengeResultsPageProps {
  challenge: Challenge;
  currentUserId: string;
  onBack: () => void;
  onViewChallenges: () => void;
}

const ChallengeResultsPage: React.FC<ChallengeResultsPageProps> = ({ challenge, currentUserId, onBack, onViewChallenges }) => {
  const isChallenger = challenge.challenger_id === currentUserId;
  const myScore = isChallenger ? challenge.challenger_score : challenge.opponent_score;
  const theirScore = isChallenger ? challenge.opponent_score : challenge.challenger_score;
  const myResults = isChallenger ? challenge.challenger_round_results : challenge.opponent_round_results;
  const theirResults = isChallenger ? challenge.opponent_round_results : challenge.challenger_round_results;
  const myName = isChallenger ? (challenge.challenger_username || 'You') : (challenge.opponent_username || 'You');
  const theirName = isChallenger ? (challenge.opponent_username || 'Opponent') : (challenge.challenger_username || 'Challenger');

  const isComplete = challenge.status === 'completed';
  const iWon = isComplete && myScore !== null && theirScore !== null && myScore > theirScore;
  const tied = isComplete && myScore === theirScore;

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
          <h1 className="text-3xl font-bold text-white">Challenge Results</h1>
        </div>

        {/* Winner Banner */}
        {isComplete && (
          <div className={`text-center py-4 rounded-2xl mb-6 ${
            iWon ? 'bg-green-500/20 border border-green-500/30' :
            tied ? 'bg-amber-500/20 border border-amber-500/30' :
            'bg-red-500/20 border border-red-500/30'
          }`}>
            <p className={`text-2xl font-black ${
              iWon ? 'text-green-400' : tied ? 'text-amber-400' : 'text-red-400'
            }`}>
              {iWon ? 'YOU WIN!' : tied ? "IT'S A TIE!" : 'YOU LOST'}
            </p>
          </div>
        )}

        {!isComplete && (
          <div className="text-center py-4 rounded-2xl mb-6 bg-amber-500/20 border border-amber-500/30">
            <p className="text-amber-400 font-semibold">Waiting for opponent to finish...</p>
            <p className="text-slate-400 text-sm mt-1">Challenge code: <span className="font-mono text-cyan-400">{challenge.challenge_code}</span></p>
          </div>
        )}

        {/* Side by Side Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* My side */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {myName[0].toUpperCase()}
              </div>
              <p className="text-white font-semibold">{myName}</p>
              <p className="text-3xl font-black text-cyan-400 mt-2">{myScore ?? '—'}</p>
            </div>
            {myResults && myResults.length > 0 && (
              <div className="space-y-2 border-t border-slate-700 pt-3">
                {myResults.map((r: RoundResult, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-400">R{r.round}</span>
                    <span className="text-white">{r.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Their side */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                {theirName[0].toUpperCase()}
              </div>
              <p className="text-white font-semibold">{theirName}</p>
              <p className="text-3xl font-black text-purple-400 mt-2">{theirScore ?? '—'}</p>
            </div>
            {theirResults && theirResults.length > 0 && (
              <div className="space-y-2 border-t border-slate-700 pt-3">
                {theirResults.map((r: RoundResult, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-400">R{r.round}</span>
                    <span className="text-white">{r.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onViewChallenges}
            className="flex-1 py-4 bg-slate-700 rounded-xl font-semibold text-white hover:bg-slate-600 transition-colors"
          >
            View All Challenges
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeResultsPage;
