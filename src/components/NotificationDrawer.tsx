import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Bell, X, Sparkles, Trophy, Coins, Radio, CheckCheck, Trash2, Check } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  const { userProfile } = useAuth();

  // Auto-mark as read when drawer is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'winner':
        return <Trophy className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'draw':
        return <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'reward':
        return <Coins className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'live':
        return <Radio className="w-4 h-4 text-red-400 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-purple-400 shrink-0" />;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#08080c] border-l border-white/10 text-white h-full p-5 sm:p-6 flex flex-col justify-between shadow-2xl relative font-sans">
        
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <Bell className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="font-mono font-black uppercase text-white text-xs tracking-wider flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-600 text-black text-[10px] font-black font-mono">
                      {unreadCount} NEW
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-white/40 font-mono">Real-time alerts & updates</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-mono font-bold text-white/70 hover:text-white uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                  title="Mark all read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Mark Read</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 mt-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 pb-6">
            {notifications.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
                  No notifications right now
                </p>
                <p className="text-white/20 text-[10px] max-w-xs mx-auto">
                  Notifications will only be sent when a new Lucky Draw is launched or when a winner is officially announced by the Admin.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = unreadNotifications.some((u) => u.id === n.id);

                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 rounded-2xl border transition relative space-y-2 group cursor-pointer ${
                      isUnread
                        ? 'bg-gradient-to-r from-orange-950/30 via-slate-900/60 to-slate-900/90 border-orange-500/40 shadow-md'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Unread Glowing Dot */}
                    {isUnread && (
                      <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {getIcon(n.type)}
                        <h4 className="font-extrabold text-white text-xs tracking-tight">
                          {n.title}
                        </h4>
                      </div>

                      {/* Admin Delete Option */}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="p-1 text-white/20 hover:text-red-400 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-white/80 text-xs leading-relaxed font-sans">
                      {n.body}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1 border-t border-white/5">
                      <span className="uppercase text-[9px] font-bold text-orange-400/80">
                        {n.type.toUpperCase()}
                      </span>
                      <span>{formatTime(n.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
