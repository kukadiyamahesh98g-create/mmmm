import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trophy,
  Dices,
  Coins,
  Ticket,
  Radio,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

interface LudoWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LudoWelcomeModal: React.FC<LudoWelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur & Darkener */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative z-10 w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-2 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden my-auto"
          >
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 via-yellow-400 to-amber-500" />

            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-white/10 flex items-start justify-between gap-4 relative">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                  <Dices className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>LUDO GAME GUIDE & REWARDS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                  <span>WELCOME TO LUDO</span>
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                </h2>
                <p className="text-xs text-amber-400/90 font-mono font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Ludo – Play, Win & Earn Coins</span>
                </p>
              </div>

              {/* Close "X" Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white/80 transition-all cursor-pointer shrink-0 border border-white/10 hover:border-amber-400 shadow-md active:scale-95 group"
                aria-label="Close Welcome Popup"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto custom-scrollbar font-sans">
              
              {/* Introduction Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950 border border-amber-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner">
                <p>
                  Welcome to the Ludo section of <strong className="text-amber-400 font-bold">1X Luck</strong>, where every match gives you the opportunity to earn coins through your performance. Challenge other players, improve your skills, and climb the leaderboard to receive higher rewards.
                </p>
              </div>

              {/* Coin Rewards Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>COIN REWARDS</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Rank-Based Rewards</span>
                </div>

                <p className="text-xs text-slate-300">
                  Your final position determines the number of coins you receive:
                </p>

                {/* 4 Rank Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  
                  {/* 1st Place */}
                  <div className="p-3 rounded-xl bg-gradient-to-b from-amber-500/20 to-slate-900 border border-amber-400/40 text-center space-y-1 shadow-md hover:border-amber-400 transition">
                    <div className="text-2xl">🥇</div>
                    <div className="text-xs font-black text-amber-300 font-mono uppercase">1st Place</div>
                    <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs font-mono">
                      <Coins className="w-3 h-3 fill-slate-950" />
                      <span>10 Coins</span>
                    </div>
                  </div>

                  {/* 2nd Place */}
                  <div className="p-3 rounded-xl bg-gradient-to-b from-slate-400/15 to-slate-900 border border-slate-400/30 text-center space-y-1 shadow-md hover:border-slate-300 transition">
                    <div className="text-2xl">🥈</div>
                    <div className="text-xs font-black text-slate-200 font-mono uppercase">2nd Place</div>
                    <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-slate-300 text-slate-950 font-black text-xs font-mono">
                      <Coins className="w-3 h-3 fill-slate-950" />
                      <span>8 Coins</span>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="p-3 rounded-xl bg-gradient-to-b from-amber-700/20 to-slate-900 border border-amber-700/40 text-center space-y-1 shadow-md hover:border-amber-600 transition">
                    <div className="text-2xl">🥉</div>
                    <div className="text-xs font-black text-amber-500 font-mono uppercase">3rd Place</div>
                    <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-amber-600 text-slate-950 font-black text-xs font-mono">
                      <Coins className="w-3 h-3 fill-slate-950" />
                      <span>6 Coins</span>
                    </div>
                  </div>

                  {/* 4th Place */}
                  <div className="p-3 rounded-xl bg-gradient-to-b from-blue-500/15 to-slate-900 border border-blue-500/30 text-center space-y-1 shadow-md hover:border-blue-400 transition">
                    <div className="text-2xl">🎖️</div>
                    <div className="text-xs font-black text-blue-300 font-mono uppercase">4th Place</div>
                    <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white font-black text-xs font-mono">
                      <Coins className="w-3 h-3 fill-white" />
                      <span>4 Coins</span>
                    </div>
                  </div>

                </div>

                <p className="text-[11px] text-amber-300/90 font-mono font-medium text-center pt-1">
                  ✨ The better you play, the more coins you can earn.
                </p>
              </div>

              {/* Use Your Coins Section */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
                  <Ticket className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>USE YOUR COINS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Coins earned from Ludo can be used to obtain <strong className="text-amber-300">Lucky Draw tickets</strong>. Each ticket gives you a chance to enter upcoming Lucky Draw events, giving you the opportunity to become one of our lucky winners.
                </p>
              </div>

              {/* YouTube Live Streams Section */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-red-400">
                  <Radio className="w-4 h-4 text-red-400 shrink-0" />
                  <span>YOUTUBE LIVE BROADCASTS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lucky Draw winners are announced live during our official <strong className="text-red-400">YouTube Live broadcasts</strong> with complete transparency and verified winner lists.
                </p>
              </div>

              {/* Fair Gameplay Notice */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>FAIR GAMEPLAY</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All matches are designed to provide a fair and enjoyable gaming experience. Play honestly, improve your ranking, and earn more coins by achieving better positions in every game.
                </p>
              </div>

            </div>

            {/* Modal Bottom Action Button */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
                Ready to play? Roll the dice and earn coins!
              </span>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                <span>START PLAYING NOW</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
