import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Coins, Sparkles, Clock, Info, HelpCircle, Play, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSmartLinkAd } from '../hooks/useSmartLinkAd';
import { SMART_LINK_URL } from '../config/ads';
import { OfflineOverlay } from './OfflineOverlay';

interface WheelSegment {
  coins: number;
  label: string;
  weight: number; // Probability weight
  chanceText: string;
  color: string;
}

// 10 Slots in Total with Exact Requested Probability Weights
const WHEEL_SEGMENTS: WheelSegment[] = [
  { coins: 1, label: '1 Coin', weight: 50, chanceText: '50% Chance', color: '#3b82f6' },   // Blue
  { coins: 2, label: '2 Coins', weight: 50, chanceText: '50% Chance', color: '#10b981' },  // Emerald
  { coins: 4, label: '4 Coins', weight: 50, chanceText: '50% Chance', color: '#f59e0b' },  // Amber
  { coins: 8, label: '8 Coins', weight: 50, chanceText: '50% Chance', color: '#8b5cf6' },  // Purple
  { coins: 10, label: '10 Coins', weight: 30, chanceText: '30% Chance', color: '#ec4899' }, // Pink
  { coins: 12, label: '12 Coins', weight: 30, chanceText: '30% Chance', color: '#06b6d4' }, // Cyan
  { coins: 14, label: '14 Coins', weight: 12, chanceText: '12% Chance', color: '#f97316' }, // Orange
  { coins: 16, label: '16 Coins', weight: 12, chanceText: '12% Chance', color: '#eab308' }, // Yellow
  { coins: 18, label: '18 Coins', weight: 8, chanceText: '8% Chance', color: '#ef4444' },  // Red
  { coins: 20, label: '20 Coins', weight: 8, chanceText: '8% Chance', color: '#a855f7' },  // Violet
];

const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour = 3600000ms

export const LuckySpinSection: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { currentUser, userProfile, addCoins } = useAuth();
  const { isOnline, checkOnline } = useOnlineStatus();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [lastSpinTime, setLastSpinTime] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [offlineError, setOfflineError] = useState<string | null>(null);
  const [spinRewardUnlocked, setSpinRewardUnlocked] = useState<boolean>(false);
  const [spinRewardClaimed, setSpinRewardClaimed] = useState<boolean>(false);
  const [spinClaimStatus, setSpinClaimStatus] = useState<string>('');

  const isSpinningRef = useRef<boolean>(false);
  const isClaimingSpinRef = useRef<boolean>(false);
  const currentSpinIdRef = useRef<number>(0);
  const claimedSpinIdRef = useRef<number>(-1);

  // Load last spin timestamp from localStorage for current user
  useEffect(() => {
    const userIdKey = currentUser?.uid || 'guest';
    const savedLastSpin = localStorage.getItem(`spin_last_time_${userIdKey}`);
    if (savedLastSpin) {
      const ts = parseInt(savedLastSpin, 10);
      setLastSpinTime(ts);
    } else {
      setLastSpinTime(0);
    }
  }, [currentUser]);

  // Hourly Countdown Timer Interval
  useEffect(() => {
    const updateTimer = () => {
      if (!lastSpinTime) {
        setSecondsRemaining(0);
        return;
      }
      const nextSpinTime = lastSpinTime + ONE_HOUR_MS;
      const diffMs = nextSpinTime - Date.now();
      if (diffMs > 0) {
        setSecondsRemaining(Math.ceil(diffMs / 1000));
      } else {
        setSecondsRemaining(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastSpinTime]);

  const canSpin = secondsRemaining <= 0;

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleClaimSpinReward = async (overrideAmount?: number) => {
    if (!currentUser || !userProfile) {
      onOpenAuth();
      return;
    }

    const amount = overrideAmount ?? wonAmount;
    if (!amount || amount <= 0) return;

    if (
      spinRewardClaimed ||
      isClaimingSpinRef.current ||
      claimedSpinIdRef.current === currentSpinIdRef.current
    ) {
      return;
    }

    isClaimingSpinRef.current = true;
    try {
      const success = await addCoins(
        amount,
        'lucky_spin',
        `Hourly Spin Reward (+${amount} Coins)`
      );
      if (success) {
        claimedSpinIdRef.current = currentSpinIdRef.current;
        setSpinRewardClaimed(true);
        setSpinRewardUnlocked(true);
        setSpinClaimStatus(`🎉 +${amount} Coins collected successfully!`);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        setSpinClaimStatus('⚠️ Error crediting coins. Tap Collect Coins to retry.');
      }
    } catch (err) {
      console.error('Error claiming spin reward:', err);
      setSpinClaimStatus('⚠️ Error crediting coins. Please try again.');
    } finally {
      isClaimingSpinRef.current = false;
    }
  };

  const {
    adStatus,
    pendingAction,
    triggerSmartLinkAd,
    handleFallbackLinkClick,
  } = useSmartLinkAd<'spin' | 'claim_spin_reward'>((completedAction) => {
    if (completedAction === 'spin') {
      handleSpinWheel();
    } else if (completedAction === 'claim_spin_reward') {
      setSpinRewardUnlocked(true);
      handleClaimSpinReward();
    }
  });

  const handleSpinButtonClick = () => {
    if (!currentUser || !userProfile) {
      onOpenAuth();
      return;
    }

    if (!canSpin || isSpinning || isSpinningRef.current) {
      return;
    }

    const currentlyOnline = isOnline && (typeof navigator === 'undefined' || navigator.onLine);
    if (!currentlyOnline) {
      setOfflineError('Internet connection is required to watch ad and spin.');
      checkOnline();
      return;
    }

    setOfflineError(null);
    triggerSmartLinkAd('spin');
  };

  const handleClaimRewardButtonClick = () => {
    if (!currentUser || !userProfile) {
      onOpenAuth();
      return;
    }

    if (!wonAmount || wonAmount <= 0 || spinRewardClaimed) {
      return;
    }

    const currentlyOnline = isOnline && (typeof navigator === 'undefined' || navigator.onLine);
    if (!currentlyOnline) {
      setSpinClaimStatus('⚠️ Internet connection is required to watch ad and collect reward.');
      checkOnline();
      return;
    }

    setSpinClaimStatus('');
    triggerSmartLinkAd('claim_spin_reward');
  };

  const handleSpinWheel = async () => {
    if (!currentUser || !userProfile) {
      onOpenAuth();
      return;
    }

    if (!canSpin || isSpinning || isSpinningRef.current) {
      return;
    }

    isSpinningRef.current = true;
    const online = await checkOnline();
    if (!online) {
      isSpinningRef.current = false;
      setOfflineError('Internet connection is required to watch ad and spin.');
      return;
    }
    currentSpinIdRef.current += 1;
    setIsSpinning(true);
    setWonAmount(null);
    setSpinRewardUnlocked(false);
    setSpinRewardClaimed(false);
    setSpinClaimStatus('');

    // Save spin timestamp immediately
    const now = Date.now();
    setLastSpinTime(now);
    const userIdKey = currentUser.uid;
    localStorage.setItem(`spin_last_time_${userIdKey}`, now.toString());

    // Pick random segment based on weight probabilities (1,2,4,8 -> 50; 10,12 -> 30; 14,16 -> 12; 18,20 -> 8)
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedIdx = 0;
    for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
      if (rand < WHEEL_SEGMENTS[i].weight) {
        selectedIdx = i;
        break;
      }
      rand -= WHEEL_SEGMENTS[i].weight;
    }
    const selectedSegment = WHEEL_SEGMENTS[selectedIdx];

    // Calculate rotation: Align center of selected segment with 12 o'clock pointer (270deg in SVG space)
    const segmentAngle = 360 / WHEEL_SEGMENTS.length; // 36deg for 10 slices
    const midAngle = selectedIdx * segmentAngle + segmentAngle / 2;
    const targetOffset = (270 - midAngle + 360) % 360;

    const currentMod = rotation % 360;
    let delta = targetOffset - currentMod;
    if (delta <= 0) delta += 360;

    // 8 full spins (2880 deg) + offset delta for longer, realistic momentum
    const nextRotation = rotation + 2880 + delta;
    setRotation(nextRotation);

    setTimeout(() => {
      isSpinningRef.current = false;
      setIsSpinning(false);
      setWonAmount(selectedSegment.coins);
      setSpinRewardUnlocked(false);
      setSpinRewardClaimed(false);
      setSpinClaimStatus(`🔒 Watch Ad to collect your +${selectedSegment.coins} Coins reward!`);
    }, 6500);
  };

  // SVG Helper parameters
  const size = 320;
  const center = size / 2;
  const radius = 150;
  const sliceAngle = 360 / WHEEL_SEGMENTS.length; // 36deg

  if (!isOnline) {
    return (
      <OfflineOverlay
        onRetry={checkOnline}
        message="No Internet Connection. Please connect to continue"
        isInline={true}
      />
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center gap-3 animate-in fade-in select-none">
      
      {/* Compact Timer Header */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-2 px-3 text-center shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>One spin available every hour</span>
        </div>

        <div className="flex items-center gap-1.5">
          {canSpin ? (
            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
              READY!
            </span>
          ) : (
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-xs font-mono font-black text-amber-300">
                {formatCountdown(secondsRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Wheel Stage */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        
        {/* Pointer Arrow at Top (12 o'clock) */}
        <div className="z-20 -mb-4 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-md animate-pulse" />

        {/* SVG Spinning Wheel Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center shrink-0">
          <div
            className="w-full h-full rounded-full shadow-[0_0_30px_rgba(234,88,12,0.2)] transition-transform duration-[6500ms] cubic-bezier(0.1, 0.75, 0.2, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full drop-shadow-xl overflow-visible"
            >
              {/* Outer Glowing Ring */}
              <circle
                cx={center}
                cy={center}
                r={radius + 6}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                className="opacity-80"
              />

              {/* 10 Wheel Segments */}
              {WHEEL_SEGMENTS.map((seg, i) => {
                const startDeg = i * sliceAngle;
                const endDeg = (i + 1) * sliceAngle;
                const midDeg = startDeg + sliceAngle / 2;

                const radStart = (startDeg * Math.PI) / 180;
                const radEnd = (endDeg * Math.PI) / 180;
                const radMid = (midDeg * Math.PI) / 180;

                const x1 = center + radius * Math.cos(radStart);
                const y1 = center + radius * Math.sin(radStart);
                const x2 = center + radius * Math.cos(radEnd);
                const y2 = center + radius * Math.sin(radEnd);

                // Text placement vector
                const tx = center + (radius * 0.65) * Math.cos(radMid);
                const ty = center + (radius * 0.65) * Math.sin(radMid);

                const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={i}>
                    {/* Sector Path */}
                    <path
                      d={d}
                      fill={seg.color}
                      stroke="#000000"
                      strokeWidth="2.5"
                    />

                    {/* Sector Text Label */}
                    <text
                      x={tx}
                      y={ty}
                      transform={`rotate(${midDeg}, ${tx}, ${ty})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontWeight="900"
                      fontSize="12"
                      className="select-none font-mono tracking-wider drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]"
                    >
                      {seg.coins}
                    </text>
                  </g>
                );
              })}

              {/* Outer Ring LED Dots */}
              {Array.from({ length: 20 }).map((_, idx) => {
                const dotAngle = (idx * 18 * Math.PI) / 180;
                const dotX = center + (radius + 6) * Math.cos(dotAngle);
                const dotY = center + (radius + 6) * Math.sin(dotAngle);
                return (
                  <circle
                    key={idx}
                    cx={dotX}
                    cy={dotY}
                    r="3"
                    fill={idx % 2 === 0 ? '#ffffff' : '#f59e0b'}
                  />
                );
              })}
            </svg>
          </div>

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-950 border-3 border-amber-400 flex flex-col items-center justify-center text-amber-400 font-black shadow-lg z-10 pointer-events-none">
            <Coins className="w-5 h-5 animate-bounce" />
            <span className="text-[8px] font-mono tracking-widest uppercase text-white/80">SPIN</span>
          </div>
        </div>

        {/* Won Reward & Smart Link Claim Section */}
        {wonAmount !== null && (
          <div className="w-full my-2 p-2.5 bg-slate-950/90 border border-amber-500/40 rounded-2xl space-y-2 text-center">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-amber-300 uppercase italic">
                🎉 You Won +{wonAmount} Coins!
              </span>
              {spinRewardClaimed ? (
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Collected
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Ad Required
                </span>
              )}
            </div>

            {!spinRewardClaimed ? (
              !spinRewardUnlocked ? (
                <div className="space-y-1.5">
                  <button
                    onClick={handleClaimRewardButtonClick}
                    disabled={adStatus === 'waiting_return'}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(52,211,153,0.4)] transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>
                      {adStatus === 'waiting_return' && pendingAction === 'claim_spin_reward'
                        ? 'Ad Opened — Return to Collect'
                        : adStatus === 'blocked' && pendingAction === 'claim_spin_reward'
                        ? `Retry Watch Ad & Claim (+${wonAmount})`
                        : `Watch Ad & Claim +${wonAmount} Coins`}
                    </span>
                  </button>

                  {adStatus === 'blocked' && pendingAction === 'claim_spin_reward' && (
                    <div className="p-2 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-[10px] font-mono text-center space-y-1.5">
                      <p className="font-bold">⚠️ Popup blocked! Allow popups or tap below to open the ad and collect reward:</p>
                      <a
                        href={SMART_LINK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleFallbackLinkClick('claim_spin_reward')}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Ad Link & Collect</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleClaimSpinReward()}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Collect +{wonAmount} Coins Now!</span>
                </button>
              )
            ) : (
              <div className="w-full py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>+{wonAmount} Coins Collected!</span>
              </div>
            )}

            {spinClaimStatus && (
              <p className={`text-[10px] font-mono font-bold ${
                spinClaimStatus.includes('⚠️') ? 'text-rose-400' : spinClaimStatus.includes('🔒') ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {spinClaimStatus}
              </p>
            )}
          </div>
        )}

        {/* Offline error notification */}
        {offlineError && (
          <div className="my-2 p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-mono font-bold text-center">
            ⚠️ {offlineError}
          </div>
        )}

        {/* Popup blocked warning for Spin */}
        {adStatus === 'blocked' && pendingAction === 'spin' && (
          <div className="w-full my-1 p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-[11px] font-mono text-center space-y-2">
            <p className="font-bold">⚠️ Browser blocked the ad popup. Allow popups or tap below to open the ad and spin:</p>
            <a
              href={SMART_LINK_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleFallbackLinkClick('spin')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[11px] uppercase tracking-wider transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Ad Link & Spin</span>
            </a>
          </div>
        )}

        {adStatus === 'waiting_return' && pendingAction === 'spin' && (
          <div className="w-full my-1 p-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] font-mono font-bold text-center">
            Ad opened in a new tab. Return here to spin the wheel!
          </div>
        )}

        {/* Spin Button */}
        <button
          onClick={handleSpinButtonClick}
          disabled={isSpinning || !canSpin || adStatus === 'waiting_return'}
          className="mt-2 w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          {isSpinning ? (
            'SPINNING WHEEL...'
          ) : adStatus === 'waiting_return' && pendingAction === 'spin' ? (
            'AD OPENED — RETURN TO SPIN'
          ) : adStatus === 'blocked' && pendingAction === 'spin' ? (
            'RETRY WATCH AD AND SPIN'
          ) : canSpin ? (
            'Watch Ad and Spin'
          ) : (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>NEXT SPIN IN {formatCountdown(secondsRemaining)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};



