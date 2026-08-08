import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface OfflineOverlayProps {
  onRetry?: () => Promise<boolean> | void;
  message?: string;
  isInline?: boolean;
}

export const OfflineOverlay: React.FC<OfflineOverlayProps> = ({
  onRetry,
  message = 'No Internet Connection. Please connect to continue',
  isInline = false,
}) => {
  const [checking, setChecking] = useState(false);

  const handleRetryClick = async () => {
    setChecking(true);
    if (onRetry) {
      await onRetry();
    }
    setTimeout(() => setChecking(false), 500);
  };

  const content = (
    <div className="bg-slate-950/95 border border-red-500/40 rounded-3xl p-6 max-w-sm w-full mx-auto text-center text-white shadow-2xl backdrop-blur-2xl relative overflow-hidden flex flex-col items-center justify-center gap-4 animate-in fade-in">
      {/* Background glow */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-600/20 rounded-full blur-2xl pointer-events-none" />

      {/* Offline Icon Badge */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-red-500/20 to-orange-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
          <WifiOff className="w-8 h-8 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full border border-slate-950 shadow">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Notice Heading & Prompt Message */}
      <div className="space-y-1.5">
        <h3 className="text-base font-black uppercase tracking-wider text-red-400 italic">
          ONLINE CONNECTION REQUIRED
        </h3>
        <p className="text-sm font-medium text-slate-200 leading-snug">
          {message}
        </p>
        <p className="text-[11px] font-mono text-slate-400">
          Ludo, Spin & Win and Coin Rewards require an active internet connection to prevent offline exploits.
        </p>
      </div>

      {/* Retry Action Button */}
      <button
        onClick={handleRetryClick}
        disabled={checking}
        className="w-full py-3 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-black text-xs font-mono uppercase tracking-widest rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
        <span>{checking ? 'CHECKING CONNECTION...' : 'RETRY'}</span>
      </button>
    </div>
  );

  if (isInline) {
    return <div className="w-full my-auto py-4 flex items-center justify-center px-2 z-30">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      {content}
    </div>
  );
};
