import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Youtube,
  Radio,
  ExternalLink,
  Sparkles,
  Trophy,
  Bell,
  Tv,
  ChevronRight,
  ShieldCheck,
  Play
} from 'lucide-react';

interface YouTubeLiveWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  directUrl: string;
}

export const YouTubeLiveWelcomeModal: React.FC<YouTubeLiveWelcomeModalProps> = ({
  isOpen,
  onClose,
  directUrl,
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
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative z-10 w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-2 border-red-500/40 shadow-[0_0_60px_rgba(220,38,38,0.25)] overflow-hidden my-auto text-left"
          >
            {/* Top Red Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-red-500 via-amber-500 to-red-600" />

            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-white/10 flex items-start justify-between gap-4 relative">
              <div className="flex items-start gap-3.5">
                {/* Large YouTube Icon */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 p-0.5 shadow-[0_0_20px_rgba(220,38,38,0.5)] shrink-0 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Youtube className="w-7 h-7 text-red-500 fill-red-500/20" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-red-500/15 border border-red-500/30 rounded-full text-red-400 text-[11px] font-mono font-bold uppercase tracking-wider">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>OFFICIAL BROADCAST GUIDE</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                    <span>WELCOME TO YOUTUBE LIVE</span>
                  </h2>
                  <p className="text-xs text-red-400/90 font-mono font-semibold">
                    1X Luck Official Stream & Draw Announcements
                  </p>
                </div>
              </div>

              {/* Clear "×" Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-600 hover:text-white text-white/80 transition-all cursor-pointer shrink-0 border border-white/10 hover:border-red-500 shadow-md active:scale-95 group"
                aria-label="Close Welcome Popup"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto custom-scrollbar font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
              
              {/* Introduction Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 via-slate-900/90 to-slate-950 border border-red-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner space-y-2">
                <p>
                  Welcome to <strong className="text-white font-bold">YouTube Live on 1X Luck</strong>. Stay connected with every exciting event as we announce Lucky Draw winners and share prize details during our official YouTube Live broadcasts.
                </p>
              </div>

              {/* How to Participate */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>EARN & PARTICIPATE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  After collecting coins by playing <strong className="text-amber-300">Ludo</strong> and using <strong className="text-amber-300">Lucky Spin</strong>, you can use your coins to obtain Lucky Draw tickets and participate in our daily, weekly, and monthly Lucky Draw events.
                </p>
              </div>

              {/* Live Winners Announcement */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-red-400">
                  <Radio className="w-4 h-4 text-red-400 shrink-0" />
                  <span>TRANSPARENT WINNER ANNOUNCEMENTS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  During each live stream, we announce winners, share prize details, and provide updates in a clear and transparent manner.
                </p>
              </div>

              {/* Educational & Tutorial Content */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-400">
                  <Tv className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>PLATFORM VIDEOS & TUTORIALS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This section may also include helpful and informative videos related to the platform, upcoming events, game updates, tutorials, and important announcements.
                </p>
              </div>

              {/* Scheduled Event Notifications */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400">
                  <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>EVENT NOTIFICATIONS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When a live event is scheduled, you will receive a notification so you can join on time and watch the Lucky Draw results live.
                </p>
              </div>

              {/* Lucky Draw Selection & Prize Distribution */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>LUCKY DRAW SELECTION & PRIZE DISTRIBUTION</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To ensure complete transparency, every Lucky Draw winner is selected live on YouTube using one of our official random selection methods.
                </p>
                <div className="space-y-2 pl-2.5 border-l-2 border-amber-500/40 my-1">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-300 font-semibold">Method 1 – Paper Slip Draw:</strong> All eligible participant numbers are printed on identical paper slips, placed into a transparent bowl, and thoroughly mixed. One slip is randomly selected during the live stream, and that number becomes the official winning number.
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-300 font-semibold">Method 2 – Numbered Ball Draw:</strong> All eligible participant numbers are printed on identical balls of the same size, weight, color, and material. The balls are placed into a transparent bowl, thoroughly mixed, and one ball is randomly selected during the live stream.
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The entire winner selection process is shown live on YouTube so participants can watch the draw in real time. The selected number becomes the official winning number. Once the winning number is confirmed and the winner is verified, the prize amount will be awarded through your platform using the available payment method.
                </p>
              </div>

              {/* Closing Thank You */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-red-500/20 text-center space-y-1">
                <p className="text-xs font-medium text-slate-300">
                  Thank you for being a part of <strong className="text-white">1X Luck</strong>. Stay connected, stay informed, and good luck in our next YouTube Live event!
                </p>
              </div>

            </div>

            {/* Modal Bottom Action Button Area */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
                Join our official YouTube Live stream
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs font-mono rounded-2xl transition cursor-pointer active:scale-95 shrink-0"
                >
                  Dismiss
                </button>

                <a
                  href={directUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-400 text-white font-black text-xs font-mono uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>WATCH LIVE</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
