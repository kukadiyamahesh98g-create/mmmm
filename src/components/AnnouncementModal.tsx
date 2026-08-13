import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Megaphone, 
  Dices, 
  Sparkles, 
  Tv, 
  Coins, 
  Ticket, 
  Radio, 
  HelpCircle, 
  Headphones, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal?: (tab: 'terms' | 'privacy' | 'contact') => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  onOpenLegal
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur & Dimmer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-2 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden my-auto"
          >
            {/* Top Glow Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300" />

            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4 relative">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                  <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>PLATFORM ANNOUNCEMENT</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                  <span>WELCOME TO 1X LUCK</span>
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                </h2>
                <p className="text-xs text-slate-300 font-sans">
                  Fun games, exciting rewards & transparent gaming rules
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-black text-white/80 transition-all cursor-pointer shrink-0 border border-white/10 hover:border-amber-400 shadow-md active:scale-95 group"
                aria-label="Close Announcement"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Modal Body - Scrollable Text & Feature Breakdown */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto custom-scrollbar">
              
              {/* Main Full Announcement Callout */}
              <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/25 space-y-3 shadow-inner">
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-normal">
                  Welcome to <strong className="text-amber-400 font-bold">1X Luck</strong>, your destination for fun games, exciting rewards, and a fair gaming experience. Play Ludo, spin the Lucky Spin wheel, and complete available activities to earn coins. You can also earn additional coins by watching rewarded ads. Every coin you collect can be used to purchase Lucky Draw tickets. Lucky Draw winners are announced during our official YouTube Live Stream, where every draw is conducted transparently. Prize details and winner announcements are shared live, and eligible winners receive their rewards according to the event rules. If you have any questions, you can submit them through the Query section, and our support team will be happy to assist you. You can also reach us anytime through the Contact Us page. Start playing, collect coins, purchase Lucky Draw tickets, and enjoy an exciting gaming experience with 1X Luck. By continuing, you agree to our Terms & Conditions and Privacy Policy.
                </p>
              </div>

              {/* How It Works - Visual Quick Highlights */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>QUICK PLATFORM OVERVIEW</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Feature 1: Games */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg shrink-0">
                      <Dices className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Ludo & Lucky Spin</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Play classic Ludo matches or spin the fortune wheel to win free coins.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2: Rewarded Ads */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg shrink-0">
                      <Tv className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Rewarded Ads</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Watch short videos to instantly top up your coin balance anytime.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3: Lucky Draw Tickets */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg shrink-0">
                      <Ticket className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Lucky Draw Tickets</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Use your coins to buy Daily, Weekly & Monthly draw tickets.
                      </p>
                    </div>
                  </div>

                  {/* Feature 4: YouTube Live */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg shrink-0">
                      <Radio className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">YouTube Live Draws</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Transparent winner selection streamed live on YouTube with PDF logs.
                      </p>
                    </div>
                  </div>

                  {/* Feature 5: Query Section */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg shrink-0">
                      <HelpCircle className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Query Section</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Ask questions or submit issues; our support team assists quickly.
                      </p>
                    </div>
                  </div>

                  {/* Feature 6: Contact Us */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg shrink-0">
                      <Headphones className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Contact Us Page</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Reach out anytime for platform inquiries or prize redemptions.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Legal Notice Footer Links */}
              <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fair & Compliant Gaming Platform</span>
                </div>
                {onOpenLegal && (
                  <div className="flex items-center gap-3 text-[11px]">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLegal('terms');
                      }}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Terms & Conditions
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLegal('privacy');
                      }}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Bottom Action Button */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
                You can reopen this notice anytime via the <span className="text-amber-400 font-bold">Announcements</span> button.
              </p>
              
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                <span>GOT IT! START PLAYING</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
