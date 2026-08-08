import React, { useEffect, useState } from 'react';
import { X, Play, ShieldAlert, Sparkles } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { OfflineOverlay } from './OfflineOverlay';

interface AdModalProps {
  isOpen: boolean;
  onAdFinished: () => void;
  onClose?: () => void;
  rewardText: string;
  actionType?: 'start_ludo' | 'spin' | 'claim_reward' | null;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, onAdFinished, onClose, rewardText, actionType }) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const { isOnline, checkOnline } = useOnlineStatus();

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  if (!isOnline) {
    return (
      <OfflineOverlay
        onRetry={checkOnline}
        message="No Internet Connection. Please connect to continue"
      />
    );
  }

  const handleFinishAd = async () => {
    const online = await checkOnline();
    if (!online) return;
    onAdFinished();
  };

  let topButtonLabel = 'Watch Ad & Play Ludo';
  let bottomButtonLabel = 'Watch Ad & Play Ludo';
  let sectionTitle = 'Starting Ludo Match';
  let headline = '1X LUCK VIP LUDO MATCH';

  if (actionType === 'spin') {
    topButtonLabel = 'Watch Ad & Spin';
    bottomButtonLabel = 'Watch Ad & Spin';
    sectionTitle = 'Lucky Spin & Win';
    headline = '1X LUCK HOURLY SPIN';
  } else if (actionType === 'claim_reward') {
    topButtonLabel = 'Watch Ad & Collect Coins';
    bottomButtonLabel = 'Watch Ad & Collect Coins';
    sectionTitle = 'Match Completed';
    headline = '1X LUCK VIP REWARD';
  } else if (actionType === 'start_ludo') {
    topButtonLabel = 'Watch Ad & Play Ludo';
    bottomButtonLabel = 'Watch Ad & Play Ludo';
    sectionTitle = 'Starting Ludo Match';
    headline = '1X LUCK VIP LUDO MATCH';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-black/90 border border-white/10 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center backdrop-blur-xl">
        
        {/* Ad Header */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-mono text-white/50">
          <div className="flex items-center gap-1.5 font-bold text-orange-400">
            <span className="px-2 py-0.5 bg-orange-600/20 rounded-full border border-orange-500/30 text-[10px] uppercase tracking-wider">AdMob Partner</span>
            <span>1X Luck Broadcast</span>
          </div>
          <div className="flex items-center gap-2">
            {canSkip ? (
              <button
                onClick={handleFinishAd}
                className="px-3.5 py-1.5 bg-orange-600 text-black font-black uppercase tracking-wider rounded-xl text-xs hover:bg-orange-500 transition flex items-center gap-1 shadow-[0_0_10px_rgba(234,88,12,0.4)] cursor-pointer"
              >
                <span>{topButtonLabel}</span>
              </button>
            ) : (
              <span className="text-white/40 text-xs font-mono">
                Ad ends in{' '}
                <strong className="text-orange-400 font-black">{countdown}s</strong>
              </span>
            )}
            {onClose && (
              <button
                onClick={onClose}
                title="Close Ad (No Reward)"
                className="p-1 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Ad Content Container */}
        <div className="w-full bg-gradient-to-b from-orange-600/10 via-black to-purple-600/10 border border-white/10 rounded-2xl p-6 mb-4 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-black shadow-[0_0_20px_rgba(234,88,12,0.4)] mb-3">
            <Sparkles className="w-9 h-9 fill-black animate-bounce" />
          </div>

          <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-1">
            {headline}
          </h3>
          <p className="text-white/60 text-xs max-w-sm mb-3">
            Play Ludo, Spin the Lucky Wheel daily & win real prizes transparently inside 1X Luck!
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[11px] font-mono text-amber-300 font-bold">
            <Play className="w-3.5 h-3.5 fill-amber-300 animate-pulse" />
            <span>Rewarded Ad Playing In-App</span>
          </div>
        </div>

        {/* Reward Status Footer */}
        <div className="w-full bg-white/5 p-3.5 rounded-2xl border border-white/10 text-xs text-white/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <p className="font-bold text-white">{sectionTitle}</p>
              <p className="text-[10px] font-mono text-white/40">{rewardText}</p>
            </div>
          </div>

          <button
            onClick={handleFinishAd}
            disabled={!canSkip}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition ${
              canSkip
                ? 'bg-orange-600 hover:bg-orange-500 text-black cursor-pointer shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {canSkip ? bottomButtonLabel : `Wait ${countdown}s`}
          </button>
        </div>

      </div>
    </div>
  );
};
