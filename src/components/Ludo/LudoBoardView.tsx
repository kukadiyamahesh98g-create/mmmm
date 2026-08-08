import React from 'react';
import { PlayerColor, TokenState, MoveOption } from '../../types/ludo';
import {
  getTokenCoordinate,
  SAFE_TRACK_INDICES,
  TRACK_CELLS,
} from '../../lib/ludoBoardData';
import { Star, ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Trophy } from 'lucide-react';

interface LudoBoardViewProps {
  tokens: Record<PlayerColor, TokenState[]>;
  activeColor: PlayerColor;
  validMoves: MoveOption[];
  onSelectToken: (color: PlayerColor, tokenId: number) => void;
  diceValue: number | null;
  isRolling: boolean;
  onRollDice: () => void;
  playerLabels: Record<PlayerColor, string>;
  lifelines: Record<PlayerColor, number>;
  eliminated: Record<PlayerColor, boolean>;
  finishedRankings?: PlayerColor[];
  timeLeft: number;
  humanColor: PlayerColor;
  playerTypes?: Record<PlayerColor, 'human' | 'friend' | 'ai'>;
}

// Render dice dots (1..6) with 3x3 grid alignment & clear black pips
const DiceDots: React.FC<{ num: number }> = ({ num }) => {
  const gridPatterns: Record<number, boolean[]> = {
    1: [false, false, false, false, true, false, false, false, false],
    2: [false, false, true, false, false, false, true, false, false],
    3: [false, false, true, false, true, false, true, false, false],
    4: [true, false, true, false, false, false, true, false, true],
    5: [true, false, true, false, true, false, true, false, true],
    6: [true, false, true, true, false, true, true, false, true],
  };

  const pattern = gridPatterns[num] || gridPatterns[1];

  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-1.5 sm:p-2 items-center justify-items-center">
      {pattern.map((hasPip, idx) => (
        <div key={idx} className="w-full h-full flex items-center justify-center">
          {hasPip ? (
            <div
              className={`${
                num === 1 && idx === 4
                  ? 'w-3 h-3 sm:w-3.5 sm:h-3.5'
                  : 'w-2 h-2 sm:w-2.5 sm:h-2.5'
              } rounded-full bg-neutral-900 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.85),0_0.5px_1px_rgba(255,255,255,0.9)] border border-neutral-950/40`}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
};

// Lifeline hearts display
const LifelineHearts: React.FC<{ count: number; isEliminated: boolean }> = ({ count, isEliminated }) => {
  if (isEliminated || count <= 0) {
    return (
      <span className="text-[9px] font-mono font-bold text-red-400 bg-red-950/80 border border-red-500/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
        ELIMINATED
      </span>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-[10px] sm:text-xs ${
            i < count ? 'text-red-500' : 'text-slate-600 opacity-30'
          }`}
        >
          ❤️
        </span>
      ))}
    </div>
  );
};

// High-Quality Classic Ludo Dice Component
const ClassicDiceFace: React.FC<{
  value: number | null;
  isRolling: boolean;
  color: PlayerColor;
  isActive: boolean;
}> = ({ value, isRolling, isActive }) => {
  const displayNum = value || 1;

  return (
    <div
      className={`w-full h-full rounded-2xl bg-gradient-to-br from-white via-slate-50 to-neutral-200 border-2 border-neutral-300/90 shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.35)] flex items-center justify-center transform-gpu transition-all ${
        isRolling
          ? 'animate-ludo-classic-spin z-30'
          : isActive && value !== null
          ? 'animate-ludo-dice-land scale-100'
          : 'scale-100'
      }`}
    >
      <DiceDots num={isRolling ? 3 : displayNum} />
    </div>
  );
};

// Integrated Dice with 15-second Circular Visual Timer in player's color
const CornerDiceWithTimer: React.FC<{
  color: PlayerColor;
  activeColor: PlayerColor;
  playerValue: number | null;
  turnDiceValue: number | null;
  isRolling: boolean;
  timeLeft: number;
  isHuman: boolean;
  isEliminated: boolean;
  onRollDice: () => void;
}> = ({
  color,
  activeColor,
  playerValue,
  turnDiceValue,
  isRolling,
  timeLeft,
  isHuman,
  isEliminated,
  onRollDice,
}) => {
  const isActive = activeColor === color && !isEliminated;

  const hexColorMap: Record<PlayerColor, string> = {
    red: '#ef4444',
    green: '#10b981',
    yellow: '#f59e0b',
    blue: '#3b82f6',
  };

  const ringColor = hexColorMap[color];

  // SVG ring parameters
  const size = 56;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // timeLeft ranges 0..15, so fraction depleted = (15 - timeLeft) / 15
  const strokeDashoffset = isActive ? ((15 - timeLeft) / 15) * circumference : 0;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      {/* 15-Second Circular Visual Timer Ring */}
      {isActive && (
        <svg
          width={size}
          height={size}
          className="absolute -inset-1 z-10 pointer-events-none transform -rotate-90"
        >
          {/* Subtle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
          />
          {/* Active depleting circle using player color */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
      )}

      {/* Integrated Corner Dice Button */}
      <button
        onClick={() => {
          if (isActive && isHuman && !isRolling && turnDiceValue === null) {
            onRollDice();
          }
        }}
        disabled={!isActive || !isHuman || isRolling || turnDiceValue !== null || isEliminated}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all duration-200 flex items-center justify-center relative z-20 overflow-visible ${
          isActive
            ? `${
                color === 'red'
                  ? 'ring-4 ring-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                  : color === 'green'
                  ? 'ring-4 ring-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                  : color === 'yellow'
                  ? 'ring-4 ring-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.7)]'
                  : 'ring-4 ring-sky-500/60 shadow-[0_0_20px_rgba(14,165,233,0.7)]'
              } ${
                isHuman && turnDiceValue === null && !isRolling
                  ? 'cursor-pointer scale-105 hover:scale-110 active:scale-95'
                  : ''
              }`
            : 'opacity-75 shadow-sm'
        } ${isEliminated ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
      >
        <ClassicDiceFace
          value={playerValue}
          isRolling={isRolling}
          color={color}
          isActive={isActive}
        />
      </button>
    </div>
  );
};

export const LudoBoardView: React.FC<LudoBoardViewProps> = ({
  tokens,
  activeColor,
  validMoves,
  onSelectToken,
  diceValue,
  isRolling,
  onRollDice,
  playerLabels,
  lifelines,
  eliminated,
  finishedRankings = [],
  timeLeft,
  humanColor,
  playerTypes,
}) => {
  // Store each player's individual last rolled dice value
  const [playerDiceValues, setPlayerDiceValues] = React.useState<Record<PlayerColor, number | null>>({
    red: null,
    green: null,
    yellow: null,
    blue: null,
  });

  React.useEffect(() => {
    if (diceValue !== null && activeColor) {
      setPlayerDiceValues((prev) => ({
        ...prev,
        [activeColor]: diceValue,
      }));
    }
  }, [diceValue, activeColor]);
  // Safe star cell check
  const isStarCell = (r: number, c: number): boolean => {
    return SAFE_TRACK_INDICES.some((idx) => {
      const coord = TRACK_CELLS[idx];
      return coord.row === r && coord.col === c;
    });
  };

  // Get cell background styling
  const getCellBgClass = (r: number, c: number): string => {
    if (r === 7 && c >= 1 && c <= 5) return 'bg-emerald-500 border-emerald-600';
    if (c === 7 && r >= 1 && r <= 5) return 'bg-amber-400 border-amber-500';
    if (r === 7 && c >= 9 && c <= 13) return 'bg-sky-500 border-sky-600';
    if (c === 7 && r >= 9 && r <= 13) return 'bg-red-500 border-red-600';

    if (r === 6 && c === 1) return 'bg-emerald-500 border-emerald-600';
    if (r === 1 && c === 8) return 'bg-amber-400 border-amber-500';
    if (r === 8 && c === 13) return 'bg-sky-500 border-sky-600';
    if (r === 13 && c === 6) return 'bg-red-500 border-red-600';

    return 'bg-white border-slate-300';
  };

  // Group tokens at cell (r, c)
  const getTokensAtCell = (r: number, c: number) => {
    const list: { color: PlayerColor; token: TokenState }[] = [];

    (Object.keys(tokens) as PlayerColor[]).forEach((col) => {
      if (eliminated[col]) return;
      tokens[col].forEach((tok) => {
        const coord = getTokenCoordinate(col, tok.position, tok.id);
        if (coord.row === r && coord.col === c) {
          list.push({ color: col, token: tok });
        }
      });
    });

    return list;
  };

  const isTokenMoveable = (color: PlayerColor, tokenId: number): boolean => {
    if (color !== activeColor || eliminated[color]) return false;
    return validMoves.some((m) => m.tokenId === tokenId);
  };

  // Player Corner Card colors
  const CORNER_STYLES: Record<
    PlayerColor,
    { bg: string; border: string; text: string; pinFill: string }
  > = {
    green: {
      bg: 'bg-emerald-950/90',
      border: 'border-emerald-500/60',
      text: 'text-emerald-300',
      pinFill: '#16a34a',
    },
    yellow: {
      bg: 'bg-amber-950/90',
      border: 'border-amber-400/60',
      text: 'text-amber-300',
      pinFill: '#eab308',
    },
    red: {
      bg: 'bg-red-950/90',
      border: 'border-red-500/60',
      text: 'text-red-300',
      pinFill: '#dc2626',
    },
    blue: {
      bg: 'bg-sky-950/90',
      border: 'border-sky-400/60',
      text: 'text-sky-300',
      pinFill: '#0284c7',
    },
  };

  // Rotation mapping so humanColor is ALWAYS placed at Bottom-Left
  const rotationAngleMap: Record<PlayerColor, number> = {
    red: 0,
    blue: 90,
    yellow: 180,
    green: 270,
  };
  const boardRotation = rotationAngleMap[humanColor] || 0;

  // Visual Corner Card mapping (humanColor always at bottom-left `bl`)
  const getCornerColors = (hColor: PlayerColor) => {
    switch (hColor) {
      case 'red':
        return { tl: 'green' as PlayerColor, tr: 'yellow' as PlayerColor, bl: 'red' as PlayerColor, br: 'blue' as PlayerColor };
      case 'blue':
        return { tl: 'red' as PlayerColor, tr: 'green' as PlayerColor, bl: 'blue' as PlayerColor, br: 'yellow' as PlayerColor };
      case 'yellow':
        return { tl: 'blue' as PlayerColor, tr: 'red' as PlayerColor, bl: 'yellow' as PlayerColor, br: 'green' as PlayerColor };
      case 'green':
      default:
        return { tl: 'yellow' as PlayerColor, tr: 'blue' as PlayerColor, bl: 'green' as PlayerColor, br: 'red' as PlayerColor };
    }
  };
  const visualCorners = getCornerColors(humanColor);

  const getPlayerRankInfo = (col: PlayerColor) => {
    const isFinished =
      finishedRankings.includes(col) ||
      (tokens[col] && tokens[col].length > 0 && tokens[col].every((t) => t.position === 56));
    if (!isFinished) return null;

    let rIdx = finishedRankings.indexOf(col);
    if (rIdx === -1) {
      rIdx = finishedRankings.length;
    }

    if (rIdx === 0) {
      return {
        label: '🥇 1st',
        fullLabel: '🥇 1st Place',
        bg: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500',
        border: 'border-yellow-200 ring-2 ring-yellow-400/80 shadow-[0_0_20px_rgba(245,158,11,0.85)]',
        textColor: 'text-slate-950 font-black',
      };
    }
    if (rIdx === 1) {
      return {
        label: '🥈 2nd',
        fullLabel: '🥈 2nd Place',
        bg: 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300',
        border: 'border-slate-100 ring-2 ring-slate-300/80 shadow-[0_0_20px_rgba(203,213,225,0.85)]',
        textColor: 'text-slate-950 font-black',
      };
    }
    if (rIdx === 2) {
      return {
        label: '🥉 3rd',
        fullLabel: '🥉 3rd Place',
        bg: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800',
        border: 'border-amber-300 ring-2 ring-amber-500/80 shadow-[0_0_20px_rgba(180,83,9,0.85)]',
        textColor: 'text-white font-black',
      };
    }
    return {
      label: '4th',
      fullLabel: '4th Place',
      bg: 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800',
      border: 'border-slate-400 ring-2 ring-slate-500/80 shadow-[0_0_15px_rgba(71,85,105,0.85)]',
      textColor: 'text-slate-200 font-black',
    };
  };

  const greenRank = getPlayerRankInfo('green');
  const yellowRank = getPlayerRankInfo('yellow');
  const redRank = getPlayerRankInfo('red');
  const blueRank = getPlayerRankInfo('blue');

  const renderCard = (col: PlayerColor, alignLeft: boolean) => {
    const style = CORNER_STYLES[col];
    const rankInfo = getPlayerRankInfo(col);
    const isFinished = !!rankInfo;
    const isActive = activeColor === col && !eliminated[col] && !isFinished;
    const isElim = eliminated[col];
    const isHumanPlayer = playerTypes ? playerTypes[col] !== 'ai' : humanColor === col;
    const turnBadgeText =
      col === humanColor
        ? 'YOUR TURN'
        : playerTypes && playerTypes[col] === 'friend'
        ? 'FRIEND TURN'
        : 'PLAYER TURN';

    const dotColor =
      col === 'red'
        ? 'bg-red-500'
        : col === 'green'
        ? 'bg-emerald-500'
        : col === 'yellow'
        ? 'bg-amber-400'
        : 'bg-sky-500';

    const rankBadgeText = rankInfo ? rankInfo.label : 'FINISHED';

    return (
      <div
        className={`flex-1 p-2 rounded-2xl border flex items-center justify-between gap-2 shadow-lg backdrop-blur-md transition-all duration-300 relative overflow-hidden ${
          style.bg
        } ${
          isActive
            ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.02] z-20'
            : style.border
        } ${isElim ? 'opacity-40 grayscale' : ''}`}
      >
        {alignLeft ? (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <div className={`w-3 h-3 rounded-full ${dotColor} border border-white/60 shrink-0`} />
              <div className="min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <p className="text-[11px] font-mono font-black uppercase text-white truncate">
                    {playerLabels[col]}
                  </p>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[8px] font-mono font-black text-amber-300 bg-amber-400/20 px-1 py-0.2 rounded border border-amber-400/50 animate-pulse shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                      <span>{turnBadgeText}</span>
                    </span>
                  )}
                </div>
                {isFinished ? (
                  <span className="text-[10px] font-black font-mono text-amber-300 animate-pulse">
                    {rankBadgeText}
                  </span>
                ) : (
                  <LifelineHearts count={lifelines[col]} isEliminated={isElim} />
                )}
              </div>
            </div>
            {isFinished ? (
              <div className="px-2 py-1 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300 font-mono font-bold text-[10px] shrink-0">
                {rankBadgeText}
              </div>
            ) : (
              <CornerDiceWithTimer
                color={col}
                activeColor={activeColor}
                playerValue={playerDiceValues[col]}
                turnDiceValue={diceValue}
                isRolling={isRolling && activeColor === col}
                timeLeft={timeLeft}
                isHuman={isHumanPlayer}
                isEliminated={isElim}
                onRollDice={onRollDice}
              />
            )}
          </>
        ) : (
          <>
            {isFinished ? (
              <div className="px-2 py-1 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300 font-mono font-bold text-[10px] shrink-0">
                {rankBadgeText}
              </div>
            ) : (
              <CornerDiceWithTimer
                color={col}
                activeColor={activeColor}
                playerValue={playerDiceValues[col]}
                turnDiceValue={diceValue}
                isRolling={isRolling && activeColor === col}
                timeLeft={timeLeft}
                isHuman={isHumanPlayer}
                isEliminated={isElim}
                onRollDice={onRollDice}
              />
            )}
            <div className="flex items-center gap-1.5 min-w-0 text-right">
              <div className="min-w-0">
                <div className="flex items-center justify-end gap-1 min-w-0">
                  {isActive && (
                    <span className="flex items-center gap-1 text-[8px] font-mono font-black text-amber-300 bg-amber-400/20 px-1 py-0.2 rounded border border-amber-400/50 animate-pulse shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                      <span>{turnBadgeText}</span>
                    </span>
                  )}
                  <p className="text-[11px] font-mono font-black uppercase text-white truncate">
                    {playerLabels[col]}
                  </p>
                </div>
                {isFinished ? (
                  <span className="text-[10px] font-black font-mono text-amber-300 animate-pulse">
                    {rankBadgeText}
                  </span>
                ) : (
                  <LifelineHearts count={lifelines[col]} isEliminated={isElim} />
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${dotColor} border border-white/60 shrink-0`} />
            </div>
          </>
        )}
      </div>
    );
  };

  const isGreenActive = activeColor === 'green' && !eliminated.green && !finishedRankings.includes('green');
  const isYellowActive = activeColor === 'yellow' && !eliminated.yellow && !finishedRankings.includes('yellow');
  const isRedActive = activeColor === 'red' && !eliminated.red && !finishedRankings.includes('red');
  const isBlueActive = activeColor === 'blue' && !eliminated.blue && !finishedRankings.includes('blue');

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col gap-1.5 select-none">
      
      {/* TOP ROW CORNER CARDS */}
      <div className="flex justify-between items-center gap-2">
        {renderCard(visualCorners.tl, true)}
        {renderCard(visualCorners.tr, false)}
      </div>

      {/* 15x15 MAIN LUDO BOARD GRID (Rotated so human is at Bottom-Right) */}
      <div
        style={{ transform: `rotate(${boardRotation}deg)` }}
        className="w-full aspect-square bg-slate-900 border-2 sm:border-4 border-slate-700 rounded-2xl grid grid-cols-15 grid-rows-15 gap-[0.5px] overflow-hidden relative shadow-2xl transition-transform duration-500"
      >
        
        {/* GREEN HOME (Top-Left 6x6) */}
        <div className={`col-start-1 col-span-6 row-start-1 row-span-6 bg-emerald-600 border-2 relative flex flex-col justify-between p-1 transition-all duration-300 ${
          isGreenActive
            ? 'border-emerald-300 ring-4 ring-emerald-300/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_25px_rgba(16,185,129,0.9)] z-10 animate-pulse'
            : 'border-slate-900 z-0'
        }`}>
          <span
            style={{ transform: `rotate(-${boardRotation}deg)` }}
            className="text-[9px] sm:text-[10px] font-black uppercase text-white tracking-wider text-center font-sans inline-block"
          >
            GREEN
          </span>
        </div>
        <div className={`col-start-2 col-span-4 row-start-2 row-span-4 rounded-xl border shadow-inner pointer-events-none transition-all duration-300 grid grid-cols-2 grid-rows-2 z-10 ${
          isGreenActive
            ? 'bg-emerald-50/95 border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
            : 'bg-white border-emerald-700 z-1'
        }`}>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-emerald-600 border border-emerald-800 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300/50" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-emerald-600 border border-emerald-800 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300/50" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-emerald-600 border border-emerald-800 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300/50" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-emerald-600 border border-emerald-800 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300/50" />
            </div>
          </div>
        </div>

        {/* YELLOW HOME (Top-Right 6x6) */}
        <div className={`col-start-10 col-span-6 row-start-1 row-span-6 bg-amber-400 border-2 relative flex flex-col justify-between p-1 transition-all duration-300 ${
          isYellowActive
            ? 'border-amber-200 ring-4 ring-amber-300/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.5),0_0_25px_rgba(245,158,11,0.9)] z-10 animate-pulse'
            : 'border-slate-900 z-0'
        }`}>
          <span
            style={{ transform: `rotate(-${boardRotation}deg)` }}
            className="text-[9px] sm:text-[10px] font-black uppercase text-slate-900 tracking-wider text-center font-sans inline-block"
          >
            YELLOW
          </span>
        </div>
        <div className={`col-start-11 col-span-4 row-start-2 row-span-4 rounded-xl border shadow-inner pointer-events-none transition-all duration-300 grid grid-cols-2 grid-rows-2 z-10 ${
          isYellowActive
            ? 'bg-amber-50/95 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.7)]'
            : 'bg-white border-amber-500 z-1'
        }`}>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-amber-400 border border-amber-600 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-100/60" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-amber-400 border border-amber-600 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-100/60" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-amber-400 border border-amber-600 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-100/60" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-amber-400 border border-amber-600 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-100/60" />
            </div>
          </div>
        </div>

        {/* RED HOME (Bottom-Left 6x6) */}
        <div className={`col-start-1 col-span-6 row-start-10 row-span-6 bg-red-600 border-2 relative flex flex-col justify-end p-1 transition-all duration-300 ${
          isRedActive
            ? 'border-red-300 ring-4 ring-red-400/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_25px_rgba(239,68,68,0.9)] z-10 animate-pulse'
            : 'border-slate-900 z-0'
        }`}>
          <span
            style={{ transform: `rotate(-${boardRotation}deg)` }}
            className="text-[9px] sm:text-[10px] font-black uppercase text-white tracking-wider text-center font-sans mb-1 inline-block"
          >
            RED
          </span>
        </div>
        <div className={`col-start-2 col-span-4 row-start-11 row-span-4 rounded-xl border shadow-inner pointer-events-none transition-all duration-300 grid grid-cols-2 grid-rows-2 z-10 ${
          isRedActive
            ? 'bg-red-50/95 border-red-400 ring-2 ring-red-400 shadow-[0_0_15px_rgba(239,68,68,0.7)]'
            : 'bg-white border-red-700 z-1'
        }`}>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-600 border border-red-800 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-300/50" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-600 border border-red-800 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-300/50" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-600 border border-red-800 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-300/50" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-600 border border-red-800 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-300/50" />
            </div>
          </div>
        </div>

        {/* BLUE HOME (Bottom-Right 6x6) */}
        <div className={`col-start-10 col-span-6 row-start-10 row-span-6 bg-sky-500 border-2 relative flex flex-col justify-end p-1 transition-all duration-300 ${
          isBlueActive
            ? 'border-sky-200 ring-4 ring-sky-300/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_25px_rgba(56,189,248,0.9)] z-10 animate-pulse'
            : 'border-slate-900 z-0'
        }`}>
          <span
            style={{ transform: `rotate(-${boardRotation}deg)` }}
            className="text-[9px] sm:text-[10px] font-black uppercase text-white tracking-wider text-center font-sans mb-1 inline-block"
          >
            BLUE
          </span>
        </div>
        <div className={`col-start-11 col-span-4 row-start-11 row-span-4 rounded-xl border shadow-inner pointer-events-none transition-all duration-300 grid grid-cols-2 grid-rows-2 z-10 ${
          isBlueActive
            ? 'bg-sky-50/95 border-sky-400 ring-2 ring-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.7)]'
            : 'bg-white border-sky-700 z-1'
        }`}>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-sky-500 border border-sky-700 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-200/60" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-sky-500 border border-sky-700 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-200/60" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-sky-500 border border-sky-700 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-200/60" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-sky-500 border border-sky-700 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-200/60" />
            </div>
          </div>
        </div>

        {/* FINISHING POSITION OVERLAYS ON HOME AREAS */}
        {greenRank && (
          <div className="col-start-1 col-span-6 row-start-1 row-span-6 z-30 flex items-center justify-center pointer-events-none p-1">
            <div
              style={{ transform: `rotate(-${boardRotation}deg)` }}
              className={`px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-md transition-all duration-300 ${greenRank.bg} ${greenRank.border}`}
            >
              <span className={`text-xs sm:text-sm font-mono tracking-wide ${greenRank.textColor}`}>
                {greenRank.fullLabel}
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider opacity-85">
                FINISHED
              </span>
            </div>
          </div>
        )}

        {yellowRank && (
          <div className="col-start-10 col-span-6 row-start-1 row-span-6 z-30 flex items-center justify-center pointer-events-none p-1">
            <div
              style={{ transform: `rotate(-${boardRotation}deg)` }}
              className={`px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-md transition-all duration-300 ${yellowRank.bg} ${yellowRank.border}`}
            >
              <span className={`text-xs sm:text-sm font-mono tracking-wide ${yellowRank.textColor}`}>
                {yellowRank.fullLabel}
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider opacity-85">
                FINISHED
              </span>
            </div>
          </div>
        )}

        {redRank && (
          <div className="col-start-1 col-span-6 row-start-10 row-span-6 z-30 flex items-center justify-center pointer-events-none p-1">
            <div
              style={{ transform: `rotate(-${boardRotation}deg)` }}
              className={`px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-md transition-all duration-300 ${redRank.bg} ${redRank.border}`}
            >
              <span className={`text-xs sm:text-sm font-mono tracking-wide ${redRank.textColor}`}>
                {redRank.fullLabel}
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider opacity-85">
                FINISHED
              </span>
            </div>
          </div>
        )}

        {blueRank && (
          <div className="col-start-10 col-span-6 row-start-10 row-span-6 z-30 flex items-center justify-center pointer-events-none p-1">
            <div
              style={{ transform: `rotate(-${boardRotation}deg)` }}
              className={`px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 shadow-2xl backdrop-blur-md transition-all duration-300 ${blueRank.bg} ${blueRank.border}`}
            >
              <span className={`text-xs sm:text-sm font-mono tracking-wide ${blueRank.textColor}`}>
                {blueRank.fullLabel}
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider opacity-85">
                FINISHED
              </span>
            </div>
          </div>
        )}

        {/* CENTER FINISH TRIANGLES (3x3 area) */}
        <div className="col-start-7 col-span-3 row-start-7 row-span-3 bg-slate-950 border-2 border-slate-900 relative overflow-hidden flex items-center justify-center">
          <div
            className="absolute left-0 top-0 bottom-0 w-1/2 bg-emerald-600 shadow-md"
            style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-1/2 bg-amber-400 shadow-md"
            style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 bg-sky-500 shadow-md"
            style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-red-600 shadow-md"
            style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
          />
          <div
            style={{ transform: `rotate(-${boardRotation}deg)` }}
            className="z-10 bg-gradient-to-tr from-amber-400 to-yellow-200 text-black rounded-full w-5 h-5 sm:w-7 sm:h-7 border border-amber-500 flex items-center justify-center shadow-xl"
          >
            <Trophy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-black fill-black" />
          </div>
        </div>

        {/* TRACK CELLS GRID */}
        {Array.from({ length: 15 }).map((_, r) =>
          Array.from({ length: 15 }).map((_, c) => {
            const isGreenHome = r < 6 && c < 6;
            const isYellowHome = r < 6 && c >= 9;
            const isRedHome = r >= 9 && c < 6;
            const isBlueHome = r >= 9 && c >= 9;
            const isCenterArea = r >= 6 && r <= 8 && c >= 6 && c <= 8;

            if (isGreenHome || isYellowHome || isRedHome || isBlueHome || isCenterArea) {
              return null;
            }

            const isStar = isStarCell(r, c);
            const cellBg = getCellBgClass(r, c);

            const isGreenStart = r === 6 && c === 1;
            const isYellowStart = r === 1 && c === 8;
            const isBlueStart = r === 8 && c === 13;
            const isRedStart = r === 13 && c === 6;

            return (
              <div
                key={`cell-${r}-${c}`}
                style={{ gridRowStart: r + 1, gridColumnStart: c + 1 }}
                className={`relative flex items-center justify-center border-[0.5px] ${cellBg}`}
              >
                <div style={{ transform: `rotate(-${boardRotation}deg)` }} className="flex items-center justify-center">
                  {isGreenStart && <ArrowRight className="w-3 h-3 text-white animate-bounce" />}
                  {isYellowStart && <ArrowDown className="w-3 h-3 text-slate-900 animate-bounce" />}
                  {isBlueStart && <ArrowLeft className="w-3 h-3 text-white animate-bounce" />}
                  {isRedStart && <ArrowUp className="w-3 h-3 text-white animate-bounce" />}

                  {isStar && !isRedStart && !isGreenStart && !isYellowStart && !isBlueStart && (
                    <Star className="w-3 h-3 text-slate-800 fill-none stroke-[1.5]" />
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* MAP PIN TOKENS */}
        {(Object.keys(tokens) as PlayerColor[]).map((colKey) => {
          if (eliminated[colKey]) return null;

          return tokens[colKey].map((tok) => {
            const coord = getTokenCoordinate(colKey, tok.position, tok.id);
            const cellTokens = getTokensAtCell(coord.row, coord.col);
            const isMoveable = isTokenMoveable(colKey, tok.id);
            const tokenIndexInCell = cellTokens.findIndex(
              (item) => item.color === colKey && item.token.id === tok.id
            );

            const multiTokenCount = cellTokens.length;
            const offsetPx = multiTokenCount > 1 ? tokenIndexInCell * 3 : 0;

            const pinColors: Record<PlayerColor, { main: string; core: string }> = {
              green: { main: '#16a34a', core: '#15803d' },
              yellow: { main: '#eab308', core: '#ca8a04' },
              red: { main: '#dc2626', core: '#991b1b' },
              blue: { main: '#0284c7', core: '#0369a1' },
            };

            const leftPct = (coord.col / 15) * 100;
            const topPct = (coord.row / 15) * 100;

            return (
              <div
                key={`tok-${colKey}-${tok.id}`}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${(1 / 15) * 100}%`,
                  height: `${(1 / 15) * 100}%`,
                  transform: `translate(${offsetPx}px, ${offsetPx}px) rotate(-${boardRotation}deg)`,
                  transition: 'top 200ms cubic-bezier(0.25, 1, 0.5, 1), left 200ms cubic-bezier(0.25, 1, 0.5, 1)',
                }}
                className="z-30 flex items-center justify-center select-none pointer-events-auto"
              >
                <div
                  onClick={() => {
                    if (isMoveable) {
                      onSelectToken(colKey, tok.id);
                    }
                  }}
                  className={`cursor-pointer transition-all duration-200 flex items-center justify-center ${
                    isMoveable
                      ? 'scale-125 animate-bounce z-40'
                      : 'hover:scale-110'
                  }`}
                >
                  <div className={`w-5 h-6 sm:w-7 sm:h-8 relative drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)] ${
                    isMoveable ? 'ring-2 ring-amber-300 ring-offset-1 rounded-full' : ''
                  }`}>
                    <svg viewBox="0 0 24 28" className="w-full h-full">
                      <path
                        d="M12 0 C5.37 0 0 5.37 0 12 C0 18.5 9 26 12 28 C15 26 24 18.5 24 12 C24 5.37 18.63 0 12 0 Z"
                        fill={pinColors[colKey].main}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <circle cx="12" cy="11" r="5" fill="#ffffff" opacity="0.95" />
                      <circle cx="12" cy="11" r="3" fill={pinColors[colKey].core} />
                    </svg>
                  </div>
                </div>
              </div>
            );
          });
        })}

      </div>

      {/* BOTTOM ROW CORNER CARDS */}
      <div className="flex justify-between items-center gap-2">
        {renderCard(visualCorners.bl, true)}
        {renderCard(visualCorners.br, false)}
      </div>

    </div>
  );
};

