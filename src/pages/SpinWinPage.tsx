import React from 'react';
import { ArrowLeft, Coins, Sparkles } from 'lucide-react';
import { LuckySpinSection } from '../components/LuckySpinSection';
import { useAuth } from '../context/AuthContext';

interface SpinWinPageProps {
  onBack: () => void;
  onOpenAuth: () => void;
}

export const SpinWinPage: React.FC<SpinWinPageProps> = ({ onBack, onOpenAuth }) => {
  const { userProfile } = useAuth();

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-screen overflow-hidden animate-in fade-in duration-300 max-w-md mx-auto px-2 py-1 select-none">
      
      {/* Top Compact Navigation Header */}
      <div className="flex items-center justify-between gap-2 py-2 px-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-white shadow-md shrink-0">
        
        {/* Back Button & Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
            title="Return to Home Screen"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="p-1 bg-purple-500/20 text-purple-400 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h1 className="text-sm font-black italic uppercase tracking-wider text-white">
              LUCKY <span className="text-purple-400">SPIN</span>
            </h1>
          </div>
        </div>

        {/* Coin Balance Badge */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-300">{userProfile?.coinBalance || 0}</span>
        </div>

      </div>

      {/* Main Wheel View Fitting Single Viewport */}
      <div className="flex-1 flex flex-col justify-center items-center overflow-hidden py-2">
        <LuckySpinSection onOpenAuth={onOpenAuth} />
      </div>

    </div>
  );
};

