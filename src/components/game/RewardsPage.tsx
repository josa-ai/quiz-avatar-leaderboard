import React, { useState } from 'react';
import { prizes } from '@/data/gameData';
import { User, Prize } from '@/types/game';
import { redeemPrize } from '@/lib/gameService';

interface RewardsPageProps {
  user: User;
  onBack: () => void;
  onRedeem: (prize: Prize, updatedUser: User) => void;
}

const RewardsPage: React.FC<RewardsPageProps> = ({ user, onBack, onRedeem }) => {
  const [filter, setFilter] = useState<'all' | 'discount' | 'merchandise' | 'experience'>('all');
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState('');

  const filteredPrizes = filter === 'all' 
    ? prizes 
    : prizes.filter(p => p.category === filter);

  const handleRedeem = (prize: Prize) => {
    if (user.points >= prize.pointsCost && !redeemed.includes(prize.id)) {
      setSelectedPrize(prize);
      setShowConfirmation(true);
      setError('');
    }
  };

  const confirmRedeem = async () => {
    if (!selectedPrize) return;
    
    setIsRedeeming(true);
    setError('');

    try {
      const result = await redeemPrize(
        user.id,
        selectedPrize.id,
        selectedPrize.name,
        selectedPrize.pointsCost
      );

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setRedeemed([...redeemed, selectedPrize.id]);
        onRedeem(selectedPrize, result.data);
        setShowConfirmation(false);
        setSelectedPrize(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to redeem prize');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
          </svg>
        );
      case 'merchandise':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        );
      case 'experience':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'text-green-400 bg-green-500/20';
      case 'merchandise': return 'text-purple-400 bg-purple-500/20';
      case 'experience': return 'text-cyan-400 bg-cyan-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            REWARDS
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Points balance */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl p-6 border border-green-500/30 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472a4.265 4.265 0 01.264-.521z"/>
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Your Balance</p>
                <p className="text-4xl font-black text-green-400">{user.points.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Rank #{user.rank}</p>
              <p className="text-white font-semibold">{user.username}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['all', 'discount', 'merchandise', 'experience'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === f 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Prizes grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrizes.map((prize) => {
            const canAfford = user.points >= prize.pointsCost;
            const isRedeemed = redeemed.includes(prize.id);
            const categoryColors = getCategoryColor(prize.category);
            
            return (
              <div 
                key={prize.id}
                className={`bg-slate-800/80 rounded-2xl overflow-hidden border transition-all ${
                  isRedeemed 
                    ? 'border-green-500/50 opacity-60' 
                    : canAfford 
                      ? 'border-slate-700/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20' 
                      : 'border-slate-700/50 opacity-60'
                }`}
              >
                {/* Prize image */}
                <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <img 
                    src={prize.image} 
                    alt={prize.name}
                    className="w-24 h-24 object-contain"
                  />
                </div>
                
                {/* Prize info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${categoryColors}`}>
                      {getCategoryIcon(prize.category)}
                      {prize.category}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-bold text-lg mb-2">{prize.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{prize.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472a4.265 4.265 0 01.264-.521z"/>
                      </svg>
                      <span className="text-green-400 font-bold">{prize.pointsCost}</span>
                    </div>
                    
                    <button
                      onClick={() => handleRedeem(prize)}
                      disabled={!canAfford || isRedeemed}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isRedeemed
                          ? 'bg-green-500/20 text-green-400 cursor-default'
                          : canAfford
                            ? 'bg-green-500 text-white hover:bg-green-400'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isRedeemed ? 'Redeemed' : canAfford ? 'Redeem' : 'Not enough'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmation modal */}
        {showConfirmation && selectedPrize && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-4">Confirm Redemption</h3>
              <p className="text-slate-400 mb-6">
                Are you sure you want to redeem <span className="text-green-400 font-semibold">{selectedPrize.name}</span> for <span className="text-green-400 font-semibold">{selectedPrize.pointsCost} points</span>?
              </p>
              
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl mb-4">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setError('');
                  }}
                  disabled={isRedeeming}
                  className="flex-1 py-3 bg-slate-700 rounded-xl font-semibold text-white hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRedeem}
                  disabled={isRedeeming}
                  className="flex-1 py-3 bg-green-500 rounded-xl font-semibold text-white hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRedeeming ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Redeeming...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;
