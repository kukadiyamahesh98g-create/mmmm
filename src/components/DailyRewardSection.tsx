import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Gift, Calendar, CheckCircle2, Clock, Coins, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const REWARD_SCHEDULE = [
  { day: 1, rewardCoins: 1 },
  { day: 2, rewardCoins: 2 },
  { day: 3, rewardCoins: 3 },
  { day: 4, rewardCoins: 4 },
  { day: 5, rewardCoins: 5 },
  { day: 6, rewardCoins: 6 },
  { day: 7, rewardCoins: 7 },
];

export const DailyRewardSection: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { currentUser, addCoins } = useAuth();
  const [streak, setStreak] = useState<number>(1);
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const checkDailyReward = async () => {
      const rewardRef = doc(db, 'dailyRewards', currentUser.uid);
      const snap = await getDoc(rewardRef);

      const todayStr = new Date().toISOString().split('T')[0];

      if (snap.exists()) {
        const data = snap.data();
        const lastDate = data.lastClaimDate;
        const currentStreak = data.currentStreak || 1;

        if (lastDate === todayStr) {
          setClaimedToday(true);
          setStreak(currentStreak);
        } else {
          // Check if yesterday or broken streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yestStr = yesterday.toISOString().split('T')[0];

          if (lastDate === yestStr) {
            // Consecutive day
            const nextStreak = currentStreak >= 7 ? 1 : currentStreak + 1;
            setStreak(nextStreak);
          } else {
            // Broken streak, reset to Day 1
            setStreak(1);
          }
          setClaimedToday(false);
        }
      } else {
        setStreak(1);
        setClaimedToday(false);
      }
    };

    checkDailyReward();
  }, [currentUser]);

  const handleClaimReward = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (claimedToday) return;

    setLoading(true);
    setMsg(null);

    const coinsToEarn = REWARD_SCHEDULE.find((r) => r.day === streak)?.rewardCoins || streak;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      // Add coins to wallet
      await addCoins(
        coinsToEarn,
        'daily_reward',
        `Daily Reward Day ${streak} (+${coinsToEarn} Coins)`
      );

      // Save streak to Firestore
      const rewardRef = doc(db, 'dailyRewards', currentUser.uid);
      await setDoc(rewardRef, {
        lastClaimDate: todayStr,
        currentStreak: streak,
        userUid: currentUser.uid
      });

      setClaimedToday(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setMsg(`Claimed Day ${streak} Reward: +${coinsToEarn} Coins!`);
    } catch (err: any) {
      console.error(err);
      setMsg('Failed to claim daily reward.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5 text-emerald-400" /> 7-Day Daily Reward System
          </div>
          <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight">DAILY CHECK-IN <span className="text-orange-500">STREAK</span></h1>
          <p className="text-xs text-white/60">
            Log in every day to collect free Coins! Reaching Day 7 rewards 7 Coins, then resets to Day 1.
          </p>
        </div>

        <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center shrink-0">
          <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">Current Streak</p>
          <p className="text-3xl font-black text-white font-mono my-0.5">Day {streak} / 7</p>
        </div>
      </div>

      {/* Grid of 7 Days */}
      <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl space-y-6">
        <h2 className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center gap-2 font-mono">
          <Calendar className="w-4 h-4 text-emerald-400" />
          7-Day Claim Roadmap
        </h2>

        {msg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl text-center">
            {msg}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {REWARD_SCHEDULE.map((item) => {
            const isCurrent = item.day === streak;
            const isPast = item.day < streak || (item.day === streak && claimedToday);

            return (
              <div
                key={item.day}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[130px] transition-all ${
                  isCurrent && !claimedToday
                    ? 'bg-gradient-to-b from-orange-500/20 to-emerald-500/10 border-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.3)] scale-105 ring-2 ring-orange-500/50'
                    : isPast
                    ? 'bg-white/5 border-white/5 opacity-50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
                  Day {item.day}
                </span>

                <div className="my-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black mx-auto ${
                    isCurrent && !claimedToday
                      ? 'bg-orange-600 text-black shadow-lg'
                      : isPast
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-orange-400'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-mono font-black text-orange-400 block mt-1">
                    +{item.rewardCoins} {item.rewardCoins === 1 ? 'Coin' : 'Coins'}
                  </span>
                </div>

                {isCurrent && !claimedToday ? (
                  <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-[9px] rounded-full uppercase tracking-wider">
                    READY!
                  </span>
                ) : isPast ? (
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">CLAIMED</span>
                ) : (
                  <span className="text-[9px] text-white/30 font-mono">LOCKED</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="text-center pt-2">
          <button
            onClick={handleClaimReward}
            disabled={claimedToday || loading}
            className={`py-3.5 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition ${
              claimedToday
                ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-500 text-black shadow-[0_10px_30px_rgba(234,88,12,0.4)] cursor-pointer'
            }`}
          >
            {loading
              ? 'Claiming...'
              : claimedToday
              ? '✓ Already Claimed Today (Come back tomorrow)'
              : `Claim Day ${streak} (+${REWARD_SCHEDULE.find((r) => r.day === streak)?.rewardCoins} Coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};
