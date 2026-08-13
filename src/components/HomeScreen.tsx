import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LuckyDrawSection } from './LuckyDrawSection';
import { LudoSection } from './LudoSection';
import { LuckySpinSection } from './LuckySpinSection';
import { YouTubeLiveSection } from './YouTubeLiveSection';
import { 
  Trophy, 
  Gift, 
  Sparkles, 
  Radio, 
  ShieldCheck, 
  Coins, 
  Dices, 
  Play, 
  Calendar, 
  Zap, 
  Star,
  ChevronRight,
  Flame,
  Award,
  Megaphone
} from 'lucide-react';

interface HomeScreenProps {
  setActiveTab?: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenAnnouncement?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveTab, onOpenAuth, onOpenAnnouncement }) => {
  const { userProfile, currentUser } = useAuth();
  const [activeFeature, setActiveFeature] = useState<'draw' | 'ludo' | 'spin' | 'live'>('draw');
  const [selectedDrawCategory, setSelectedDrawCategory] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative z-10 pb-12">
      
      {/* Complete Profile Top Banner for Signed-In Users with incomplete profile */}
      {currentUser && !userProfile?.isProfileCompleted && (
        <div 
          onClick={() => setActiveTab && setActiveTab('profile')}
          className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 p-0.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-[1.01] transition-all group"
        >
          <div className="bg-slate-950/90 backdrop-blur-xl rounded-[14px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <Coins className="w-7 h-7 text-amber-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                    20 BONUS COINS WAITING
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white italic uppercase tracking-tight mt-0.5">
                  Complete your profile and get 20 coins.
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  Enter your full name & mobile number in Profile to unlock 20 coins instantly!
                </p>
              </div>
            </div>

            <button className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0 group-hover:bg-amber-300 cursor-pointer">
              <span>Complete Profile</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Minimal Coin Balance Display */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-white shadow-lg backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Coin Balance</p>
            <p className="text-xl sm:text-2xl font-mono font-black text-amber-300">
              {userProfile?.coinBalance || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAnnouncement && (
            <button
              onClick={onOpenAnnouncement}
              className="py-2 px-3 sm:px-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition shadow active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Megaphone className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Announcements</span>
            </button>
          )}

          {!currentUser && (
            <button
              onClick={() => onOpenAuth('signup')}
              className="py-2 px-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition shadow active:scale-95 cursor-pointer shrink-0"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
          <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-wider text-white">
            SELECT FEATURE & GAME
          </h2>
        </div>
        <span className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Tap any card below to launch
        </span>
      </div>

      {/* ========================================================================= */}
      {/* FOUR LARGE PREMIUM FEATURE CARDS GRID (LAUNCH DEDICATED FULL-SCREEN PAGES) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 1: LUCKY DRAW PAGE LAUNCHER */}
        {/* ----------------------------------------------------------------------- */}
        <div
          onClick={() => setActiveTab && setActiveTab('luckydraw')}
          className="group cursor-pointer relative overflow-hidden rounded-3xl border-2 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between min-h-[280px] sm:min-h-[300px] bg-gradient-to-br from-neutral-900/90 via-black/80 to-amber-950/40 border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_35px_rgba(251,191,36,0.3)] hover:scale-[1.01]"
        >
          {/* Background Rays */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Header & Illustration Layout */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-[65%]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                <Trophy className="w-3 h-3 text-amber-400" /> MEGA JACKPOTS
              </div>
              <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors">
                LUCKY DRAW
              </h3>
              <p className="text-xs text-white/70 font-sans leading-snug">
                Enter ticket numbers & win mega cash/coin rewards in daily, weekly, and monthly draws.
              </p>
            </div>

            {/* Premium Trophy & Gift Box Artwork */}
            <div className="relative w-24 sm:w-28 h-24 sm:h-28 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-yellow-300/20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
              <div className="relative w-full h-full bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 rounded-2xl p-3 shadow-2xl flex flex-col items-center justify-center border border-yellow-300/50">
                <Trophy className="w-10 sm:w-12 h-10 sm:h-12 text-black drop-shadow-md animate-bounce-slow" />
                <div className="mt-1 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-amber-400 tracking-wider uppercase border border-amber-400/40">
                  GOLDEN
                </div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
              <Gift className="absolute -bottom-2 -left-2 w-6 h-6 text-amber-400 drop-shadow-lg" />
            </div>
          </div>

          {/* Three Categories Preview */}
          <div className="relative z-10 my-4 bg-black/60 border border-amber-500/20 p-2.5 rounded-2xl backdrop-blur-md grid grid-cols-3 divide-x divide-white/10 text-center">
            <div className="space-y-0.5 px-1">
              <p className="text-[10px] font-mono text-amber-400 uppercase font-bold">DAILY</p>
              <p className="text-xs font-black text-white">₹500 Prize</p>
            </div>
            <div className="space-y-0.5 px-1">
              <p className="text-[10px] font-mono text-amber-400 uppercase font-bold">WEEKLY</p>
              <p className="text-xs font-black text-white">₹2,500 Prize</p>
            </div>
            <div className="space-y-0.5 px-1">
              <p className="text-[10px] font-mono text-amber-400 uppercase font-bold">MONTHLY</p>
              <p className="text-xs font-black text-white">₹10,000 Prize</p>
            </div>
          </div>

          {/* Action Footer Button */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-amber-500/20">
            <span className="text-xs font-mono font-bold text-amber-300/80">
              Dedicated Full-Screen Page
            </span>
            <div className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.4)] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>OPEN LUCKY DRAW 🚀</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 2: LUDO GAME PAGE LAUNCHER */}
        {/* ----------------------------------------------------------------------- */}
        <div
          onClick={() => setActiveTab && setActiveTab('ludo')}
          className="group cursor-pointer relative overflow-hidden rounded-3xl border-2 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between min-h-[280px] sm:min-h-[300px] bg-gradient-to-br from-neutral-900/90 via-black/80 to-blue-950/40 border-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_35px_rgba(59,130,246,0.3)] hover:scale-[1.01]"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Info */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-[65%]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                <Dices className="w-3 h-3 text-blue-400" /> CLASSIC BOARD
              </div>
              <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white group-hover:text-blue-300 transition-colors">
                LUDO MATCH
              </h3>
              <p className="text-xs text-white/70 font-sans leading-snug">
                Play authentic 2-4 player Ludo with online players on a dedicated gaming board page!
              </p>
            </div>

            {/* Custom Board Graphic */}
            <div className="relative w-24 sm:w-28 h-24 sm:h-28 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-2xl p-1.5 border-2 border-blue-400/60 shadow-2xl grid grid-cols-2 gap-1 group-hover:rotate-3 transition-transform duration-300">
                <div className="bg-red-600/90 rounded-lg p-1.5 flex items-center justify-center border border-red-400/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                </div>
                <div className="bg-emerald-600/90 rounded-lg p-1.5 flex items-center justify-center border border-emerald-400/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                </div>
                <div className="bg-blue-600/90 rounded-lg p-1.5 flex items-center justify-center border border-blue-400/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                </div>
                <div className="bg-amber-500/90 rounded-lg p-1.5 flex items-center justify-center border border-amber-300/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-white to-neutral-200 border-2 border-blue-400 text-black p-2 rounded-xl shadow-2xl animate-bounce-slow flex items-center justify-center">
                <Dices className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Ludo Highlights */}
          <div className="relative z-10 my-4 bg-black/60 border border-blue-500/20 p-2.5 rounded-2xl backdrop-blur-md flex items-center justify-around text-center">
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-blue-300 uppercase font-bold">MODE</p>
              <p className="text-xs font-black text-white">2-4 Players</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-blue-300 uppercase font-bold">REWARD</p>
              <p className="text-xs font-black text-amber-300">2x Coins</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-blue-300 uppercase font-bold">STATUS</p>
              <p className="text-xs font-black text-emerald-400">Instant Arena</p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-blue-500/20">
            <span className="text-xs font-mono font-bold text-blue-300/80">
              Dedicated Full-Screen Page
            </span>
            <div className="py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>PLAY LUDO 🎲</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 3: LUCKY SPIN PAGE LAUNCHER */}
        {/* ----------------------------------------------------------------------- */}
        <div
          onClick={() => setActiveTab && setActiveTab('spin')}
          className="group cursor-pointer relative overflow-hidden rounded-3xl border-2 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between min-h-[280px] sm:min-h-[300px] bg-gradient-to-br from-neutral-900/90 via-black/80 to-purple-950/40 border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.3)] hover:scale-[1.01]"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Info */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-[65%]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-purple-400" /> DAILY FORTUNE
              </div>
              <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors">
                LUCKY SPIN
              </h3>
              <p className="text-xs text-white/70 font-sans leading-snug">
                Spin the 10-slot fortune wheel every hour on its dedicated full-screen page & win coins!
              </p>
            </div>

            {/* Spinning Wheel Graphic */}
            <div className="relative w-24 sm:w-28 h-24 sm:h-28 shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full border-4 border-amber-400/80 p-0.5 bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-[spin_10s_linear_infinite] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full relative rounded-full">
                  <div className="absolute inset-0 bg-conic-gradient from-purple-600 via-pink-500 via-amber-400 via-cyan-500 to-purple-600 opacity-90" />
                  <div className="absolute inset-2 rounded-full border border-white/30 flex items-center justify-center">
                    <span className="text-[8px] font-mono font-black text-black bg-amber-300 px-1 rounded">500x</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-5 bg-amber-400 clip-path-triangle drop-shadow-md z-10 animate-bounce" />
            </div>
          </div>

          {/* Spin Highlights */}
          <div className="relative z-10 my-4 bg-black/60 border border-purple-500/20 p-2.5 rounded-2xl backdrop-blur-md flex items-center justify-around text-center">
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-purple-300 uppercase font-bold">WIN RATE</p>
              <p className="text-xs font-black text-emerald-400">100% Guaranteed</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-purple-300 uppercase font-bold">SLOTS</p>
              <p className="text-xs font-black text-amber-300">10 Segments</p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-purple-500/20">
            <span className="text-xs font-mono font-bold text-purple-300/80">
              Dedicated Full-Screen Page
            </span>
            <div className="py-2.5 px-4 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform animate-pulse">
              <span>SPIN NOW 🎰</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 4: LIVE BROADCAST PAGE LAUNCHER */}
        {/* ----------------------------------------------------------------------- */}
        <div
          onClick={() => setActiveTab && setActiveTab('live')}
          className="group cursor-pointer relative overflow-hidden rounded-3xl border-2 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between min-h-[280px] sm:min-h-[300px] bg-gradient-to-br from-neutral-900/90 via-black/80 to-red-950/40 border-red-500/30 hover:border-red-400 hover:shadow-[0_0_35px_rgba(239,68,68,0.3)] hover:scale-[1.01]"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Info */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-[65%]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-black">YOUTUBE LIVE</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white group-hover:text-red-300 transition-colors">
                LIVE STREAM
              </h3>
              <p className="text-xs text-white/70 font-sans leading-snug">
                Watch live winner announcements, stream broadcasts & audience chat on dedicated studio page!
              </p>
            </div>

            {/* YouTube Live Style Graphic */}
            <div className="relative w-24 sm:w-28 h-24 sm:h-28 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-2xl p-2 border-2 border-red-500/60 shadow-2xl flex flex-col justify-between overflow-hidden relative group-hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </div>
                  <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                </div>

                <div className="self-center my-auto w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg border border-red-300/40">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>

                <div className="flex items-end justify-center gap-1 h-3">
                  <div className="w-1 bg-red-500 rounded-full h-full animate-pulse" />
                  <div className="w-1 bg-red-400 rounded-full h-1/2 animate-pulse" />
                  <div className="w-1 bg-red-500 rounded-full h-3/4 animate-pulse" />
                  <div className="w-1 bg-red-300 rounded-full h-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Stream Status */}
          <div className="relative z-10 my-4 bg-black/60 border border-red-500/20 p-2.5 rounded-2xl backdrop-blur-md flex items-center justify-around text-center">
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-red-300 uppercase font-bold">STATUS</p>
              <p className="text-xs font-black text-red-400 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Broadcast Active
              </p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-red-300 uppercase font-bold">AUDIENCE</p>
              <p className="text-xs font-black text-white">1,400+ Watching</p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-red-500/20">
            <span className="text-xs font-mono font-bold text-red-300/80">
              Dedicated Full-Screen Page
            </span>
            <div className="py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>WATCH LIVE 🔴</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
    </div>
  );
};
