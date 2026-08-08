import React from 'react';
import { Sparkles } from 'lucide-react';

interface Dice3DProps {
  value: number | null;
  isRolling: boolean;
  disabled: boolean;
  colorName?: string;
  onRoll: () => void;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  disabled,
  colorName = 'orange',
  onRoll,
}) => {
  // Render dot patterns for 1..6
  const renderDots = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex items-center justify-between p-2">
            <div className="w-3 h-3 rounded-full bg-slate-900" />
            <div className="w-3 h-3 rounded-full bg-slate-900 self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex items-center justify-between p-2">
            <div className="w-3 h-3 rounded-full bg-slate-900" />
            <div className="w-3 h-3 rounded-full bg-slate-900 self-center" />
            <div className="w-3 h-3 rounded-full bg-slate-900 self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 gap-2 p-2.5">
            <div className="w-3 h-3 rounded-full bg-slate-900" />
            <div className="w-3 h-3 rounded-full bg-slate-900" />
            <div className="w-3 h-3 rounded-full bg-slate-900" />
            <div className="w-3 h-3 rounded-full bg-slate-900" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full grid grid-cols-3 gap-1 p-2 items-center justify-items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div />
            <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <div />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 gap-1.5 p-2 items-center justify-items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono font-bold uppercase">
            ROLL
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={`group relative w-16 h-16 rounded-2xl bg-gradient-to-b from-white to-slate-200 border-2 border-slate-300 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all transform active:scale-90 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 cursor-pointer shadow-[0_0_20px_rgba(234,88,12,0.5)]'
        } ${isRolling ? 'animate-spin scale-110' : ''}`}
      >
        {/* Glow halo when rolling */}
        {isRolling && (
          <div className="absolute inset-0 rounded-2xl bg-orange-500/30 blur-md animate-pulse" />
        )}

        {/* 3D Face */}
        <div className="w-full h-full rounded-xl overflow-hidden relative z-10 flex items-center justify-center">
          {renderDots(value || 0)}
        </div>

        {/* 6 Indicator Sparkle */}
        {value === 6 && !isRolling && (
          <div className="absolute -top-2 -right-2 bg-amber-400 text-black p-1 rounded-full shadow-lg animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
          </div>
        )}
      </button>

      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/60">
        {isRolling ? 'Rolling...' : value ? `Rolled: ${value}` : 'Tap Dice'}
      </span>
    </div>
  );
};
