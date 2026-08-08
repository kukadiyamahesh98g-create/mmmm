import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Trophy, Sparkles, Coins, Radio, X, ExternalLink, ShieldAlert } from 'lucide-react';

interface NotificationBarProps {
  onOpenDrawer: () => void;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({ onOpenDrawer }) => {
  const { activeNotification, dismissNotificationBar, markAsRead } = useNotifications();

  if (!activeNotification) {
    return null;
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'winner':
        return {
          bg: 'bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-slate-950/95',
          border: 'border-amber-500/50',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />,
          label: 'WINNER ANNOUNCEMENT',
        };
      case 'draw':
        return {
          bg: 'bg-gradient-to-r from-orange-950/90 via-orange-900/80 to-slate-950/95',
          border: 'border-orange-500/50',
          badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          icon: <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />,
          label: 'NEW LUCKY DRAW',
        };
      case 'reward':
        return {
          bg: 'bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-slate-950/95',
          border: 'border-emerald-500/50',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Coins className="w-4 h-4 text-emerald-400" />,
          label: 'REWARD RECEIVED',
        };
      case 'live':
        return {
          bg: 'bg-gradient-to-r from-red-950/90 via-rose-900/80 to-slate-950/95',
          border: 'border-red-500/50',
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: <Radio className="w-4 h-4 text-red-400 animate-pulse" />,
          label: 'LIVE BROADCAST',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-purple-950/90 via-slate-900/90 to-slate-950/95',
          border: 'border-purple-500/50',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <Bell className="w-4 h-4 text-purple-400" />,
          label: 'SYSTEM NOTIFICATION',
        };
    }
  };

  const style = getTypeStyle(activeNotification.type);

  // Format creation time relative
  const getTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch {
      return 'Recent';
    }
  };

  const handleOpen = () => {
    markAsRead(activeNotification.id);
    onOpenDrawer();
  };

  return (
    <div className="w-full relative z-30 animate-in slide-in-from-top-2 duration-300">
      <div className={`${style.bg} border-b ${style.border} backdrop-blur-md px-4 py-2.5 sm:py-3 shadow-lg text-white`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          
          {/* Main Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
              {style.icon}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${style.badgeBg}`}>
                  {style.label}
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  {getTimeAgo(activeNotification.createdAt)}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                {activeNotification.title}
                <span className="font-normal text-white/80 ml-2 text-xs hidden md:inline">
                  — {activeNotification.body}
                </span>
              </p>
              <p className="text-xs text-white/70 font-sans leading-tight line-clamp-1 md:hidden">
                {activeNotification.body}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleOpen}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-mono font-bold text-white uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => dismissNotificationBar(activeNotification.id)}
              className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
