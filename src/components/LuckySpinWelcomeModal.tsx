import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Clock,
  Coins,
  Ticket,
  Radio,
  Flame,
  ChevronRight,
  RotateCw,
  Gift,
  HelpCircle
} from 'lucide-react';

interface LuckySpinWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LuckySpinWelcomeModal: React.FC<LuckySpinWelcomeModalProps> = ({
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
                  <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>HOURLY FORTUNE WHEEL</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                  <span>WELCOME TO LUCKY SPIN</span>
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                </h2>
                <p className="text-xs text-amber-400/90 font-mono font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Lucky Spin – Spin Every Hour & Earn Coins</span>
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
                  Welcome to the Lucky Spin section of <strong className="text-amber-400 font-bold">1X Luck</strong>. Spin the Lucky Wheel every hour for a chance to earn free coins. Every spin gives you an opportunity to receive different coin rewards, making every hour more exciting.
                </p>
              </div>

              {/* How It Works Section */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>HOW IT WORKS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  One free spin is available every hour. Each spin rewards a random number of coins based on the result of the wheel.
                </p>
              </div>

              {/* Reward Potential Badges */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>WHEEL COIN MULTIPLIERS</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Up to 20 Coins / Spin</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[1, 2, 4, 8, 10, 12, 14, 16, 18, 20].map((amt) => (
                    <span
                      key={amt}
                      className="px-2.5 py-1 bg-slate-900 border border-amber-500/30 rounded-lg text-amber-400 font-mono font-black text-xs shadow-sm flex items-center gap-1"
                    >
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>+{amt}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Use Your Coins Section */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
                  <Ticket className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>USE YOUR COINS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Coins earned from Lucky Spin can be used to obtain <strong className="text-amber-300">Lucky Draw tickets</strong>. Each ticket gives you a chance to enter upcoming Lucky Draw events and increases your opportunity to become one of our lucky winners.
                </p>
              </div>

              {/* YouTube Live Streams Section */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-red-400">
                  <Radio className="w-4 h-4 text-red-400 shrink-0" />
                  <span>YOUTUBE LIVE BROADCASTS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lucky Draw winners are announced during official <strong className="text-red-400">YouTube Live broadcasts</strong>, ensuring total transparency for all participants.
                </p>
              </div>

              {/* Play Regularly Notice */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PLAY REGULARLY</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The more frequently you spin, the more coins you can collect. Regular participation helps you earn additional Lucky Draw tickets and improves your chances of joining future prize events.
                </p>
              </div>

            </div>

            {/* Modal Bottom Action Button */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
                Spin every hour to maximize your coins!
              </span>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                <span>SPIN NOW & WIN COINS</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
