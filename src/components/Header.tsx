import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Shield, LogOut, Sparkles, Megaphone } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  unreadNotifsCount?: number;
  onToggleNotifs: () => void;
  onOpenAnnouncement?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onToggleNotifs,
  onOpenAnnouncement
}) => {
  const { userProfile, currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-40 bg-[#050508]/80 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-105 transition">
            <span className="font-black text-lg">1X</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tighter italic text-white group-hover:text-amber-400 transition">
                LUCK
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-orange-600 text-black tracking-wider shadow-[0_0_10px_rgba(234,88,12,0.4)]">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-white/40 -mt-1 hidden sm:block font-mono uppercase tracking-wider">Verified Draws</p>
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2.5">
          {/* Announcements / Info Button */}
          {onOpenAnnouncement && (
            <button
              onClick={onOpenAnnouncement}
              className="p-2 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Announcements & Platform Rules"
            >
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline font-mono text-[11px] font-bold uppercase tracking-wider">Announcements</span>
            </button>
          )}

          {currentUser && userProfile ? (
            <>
              {/* Notification Bell */}
              <button
                onClick={onToggleNotifs}
                className="relative p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-orange-600 text-black rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-[0_0_8px_rgba(234,88,12,0.6)] px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Admin Panel Link */}
              {userProfile.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Profile Button */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-white/15 text-white border-white/30'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-black font-black text-[10px] flex items-center justify-center">
                  {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:inline max-w-[90px] truncate">{userProfile.displayName}</span>
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-white/40 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.4)] transition flex items-center gap-2 cursor-pointer font-mono"
              >
                <Sparkles className="w-4 h-4" /> Sign In with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
