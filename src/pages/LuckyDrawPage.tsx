import React, { useState } from 'react';
import { ArrowLeft, Ticket as TicketIcon, Radio, Coins, Sparkles, Youtube, ExternalLink, Calendar, MessageSquare, Send } from 'lucide-react';
import { LuckyDrawSection } from '../components/LuckyDrawSection';
import { YouTubeLiveSection } from '../components/YouTubeLiveSection';
import { useAuth } from '../context/AuthContext';

interface LuckyDrawPageProps {
  onBack: () => void;
  onOpenAuth: () => void;
  initialTab?: 'draws' | 'stream';
}

export const LuckyDrawPage: React.FC<LuckyDrawPageProps> = ({ onBack, onOpenAuth, initialTab = 'draws' }) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'draws' | 'stream'>(initialTab);

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto pb-10 animate-in fade-in duration-300 max-w-lg mx-auto px-2 py-1 select-none">
      
      {/* Top Combined Segmented Navigation Header */}
      <div className="flex items-center justify-between gap-2 py-2 px-3 bg-slate-900/95 border border-slate-800 rounded-2xl text-white shadow-md shrink-0 sticky top-0 z-30 backdrop-blur-md">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
          title="Return to Home Screen"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Combined Segmented Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('draws')}
            className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider font-mono transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'draws'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TicketIcon className="w-3.5 h-3.5" />
            <span>Lucky Draw</span>
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider font-mono transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stream'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Live Stream</span>
          </button>
        </div>

        {/* Coin Balance Badge */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 shrink-0">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-300">{userProfile?.coinBalance || 0}</span>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 py-1.5 flex flex-col">
        {activeTab === 'draws' ? (
          <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-3 shadow-xl">
            <LuckyDrawSection onOpenAuth={onOpenAuth} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-3 shadow-xl">
            <YouTubeLiveSection />
          </div>
        )}
      </div>

    </div>
  );
};

