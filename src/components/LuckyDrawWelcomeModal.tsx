import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Trophy,
  Ticket,
  Coins,
  Calendar,
  Clock,
  Award,
  Radio,
  Flame,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LuckyDrawWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LuckyDrawWelcomeModal: React.FC<LuckyDrawWelcomeModalProps> = ({
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
            className="relative z-10 w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-2 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden my-auto text-left"
          >
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 via-yellow-400 to-amber-500" />

            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-white/10 flex items-start justify-between gap-4 relative">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>REWARD & TICKET GUIDE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                  <span>WELCOME TO LUCKY DRAW</span>
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                </h2>
                <p className="text-xs text-amber-400/90 font-mono font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Turn Gaming Achievements into Exciting Rewards</span>
                </p>
              </div>

              {/* Clear "×" Close Button */}
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
                  Welcome to <strong className="text-amber-400 font-bold">Lucky Draw</strong>, turn your gaming achievements into exciting reward opportunities! Earn by playing Ludo and using Lucky Spin. Every 20 coins gets you 1 Lucky Draw ticket.
                </p>
              </div>

              {/* Event Types Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-amber-400" />
                    <span>CHOOSE YOUR EVENT</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">20 Coins / Ticket</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Daily Draw */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-center space-y-1 shadow-sm">
                    <Clock className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-xs font-black text-white font-mono uppercase">Daily Draw</div>
                    <div className="text-[10px] text-slate-400 font-mono">₹500 Cash Prize</div>
                  </div>

                  {/* Weekly Draw */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-center space-y-1 shadow-sm">
                    <Calendar className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-xs font-black text-white font-mono uppercase">Weekly Draw</div>
                    <div className="text-[10px] text-slate-400 font-mono">₹2,500 Cash Prize</div>
                  </div>

                  {/* Monthly Draw */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-center space-y-1 shadow-sm">
                    <Award className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-xs font-black text-white font-mono uppercase">Monthly Draw</div>
                    <div className="text-[10px] text-slate-400 font-mono">₹10,000 Jackpot</div>
                  </div>

                </div>
              </div>

              {/* Unlimited Ticket Purchases */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>UNLIMITED TICKET PURCHASES</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose the event you like—Daily, Weekly, or Monthly. There is no limit to how many tickets you can purchase, so the more you play, the more chances you have to join upcoming Lucky Draw events.
                </p>
              </div>

              {/* Official YouTube Live Announcements */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-red-400">
                  <Radio className="w-4 h-4 text-red-400 shrink-0" />
                  <span>OFFICIAL YOUTUBE LIVE ANNOUNCEMENTS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All winners are announced during our official <strong className="text-red-400">YouTube Live broadcast</strong>. Everything is done transparently, giving everyone a fair and fun experience.
                </p>
              </div>

              {/* Fair & Transparent Summary */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>FAIR & TRANSPARENT EXPERIENCE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Start collecting coins, get your Lucky Draw tickets, and enjoy thrilling reward opportunities with <strong className="text-amber-300">1X Luck</strong>.
                </p>
              </div>

            </div>

            {/* Modal Bottom Action Button */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
                Get your tickets now & join the next draw!
              </span>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                <span>GET TICKETS NOW</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
