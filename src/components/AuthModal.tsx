import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, ShieldCheck, Coins } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Google Sign-In failed. Please try again.';
      if (err.code === 'auth/popup-blocked') {
        msg = 'Aapke browser ne popup block kar diya. Kripya browser ke top-right se popups allow karein ya app ko nayi tab me kholein.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Yeh domain Firebase Authentication me authorized nahi hai. Firebase Console -> Authentication -> Settings -> Authorized Domains me is domain ko add karein.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in window band ho gayi. Kripya firse koshish karein.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-8 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Subtle background glow accents */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> 1X LUCK PLATFORM
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
            GOOGLE SIGN-IN
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            One-click secure login with your Google account
          </p>
        </div>

        {/* Profile Completion Bonus Callout */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-slate-800 border border-amber-500/30 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl shrink-0">
            <Coins className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
              20 Coins Profile Bonus
            </p>
            <p className="text-[11px] text-slate-300 leading-tight">
              Enter your name & mobile number after signing in to claim 20 free coins!
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono rounded-xl">
            {error}
          </div>
        )}

        {/* Primary Google Sign-In Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm font-mono rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="pt-2 flex flex-col items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fast, safe & encrypted authentication</span>
            </div>
            {window.self !== window.top && (
              <a
                href={window.location.href}
                target="_blank"
                rel="noreferrer"
                className="mt-1 text-xs text-amber-400 hover:underline font-sans font-semibold flex items-center gap-1"
              >
                <span>Open in New Tab for Google Sign-In</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
