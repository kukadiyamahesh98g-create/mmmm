import { MoveOption, PlayerColor, TokenState } from '../types/ludo';
import { getGlobalTrackIndex, isGlobalTrackSafe } from './ludoBoardData';

/**
 * Calculate all valid moves for a player with a given dice roll
 */
export function getValidMoves(
  color: PlayerColor,
  diceRoll: number,
  allTokens: Record<PlayerColor, TokenState[]>
): MoveOption[] {
  const playerTokens = allTokens[color];
  const validMoves: MoveOption[] = [];

  playerTokens.forEach((token) => {
    // 1. Token in base (-1)
    if (token.position === -1) {
      if (diceRoll === 6) {
        // Can leave base to start position (0)
        const targetPos = 0;
        const capture = checkCapture(color, targetPos, allTokens);
        validMoves.push({
          tokenId: token.id,
          fromPos: -1,
          toPos: 0,
          isCapture: !!capture,
          isEnteringHome: false,
          isLeavingBase: true,
          captureColor: capture?.color,
          captureTokenId: capture?.id,
        });
      }
      return;
    }

    // 2. Token already at home finish (56)
    if (token.position === 56) {
      return; // Finished token cannot move
    }

    // 3. Token on track or home stretch (0..55)
    const targetPos = token.position + diceRoll;

    // Exact roll required for final home (56)
    if (targetPos > 56) {
      return; // Cannot overshoot
    }

    const isEnteringHome = targetPos === 56;
    const capture = targetPos <= 50 ? checkCapture(color, targetPos, allTokens) : null;

    validMoves.push({
      tokenId: token.id,
      fromPos: token.position,
      toPos: targetPos,
      isCapture: !!capture,
      isEnteringHome,
      isLeavingBase: false,
      captureColor: capture?.color,
      captureTokenId: capture?.id,
    });
  });

  return validMoves;
}

/**
 * Check if landing on `targetPos` (0..50) for `color` captures an opponent token
 */
function checkCapture(
  color: PlayerColor,
  targetPos: number,
  allTokens: Record<PlayerColor, TokenState[]>
): { color: PlayerColor; id: number } | null {
  // If in base or home stretch, cannot capture
  if (targetPos < 0 || targetPos > 50) return null;

  const globalTrackIdx = getGlobalTrackIndex(color, targetPos);
  if (globalTrackIdx === null) return null;

  // Safe cells CANNOT be captured
  if (isGlobalTrackSafe(globalTrackIdx)) {
    return null;
  }

  // Check all opponent tokens
  for (const [oppColorKey, oppTokens] of Object.entries(allTokens)) {
    const oppColor = oppColorKey as PlayerColor;
    if (oppColor === color) continue;

    for (const oppToken of oppTokens) {
      if (oppToken.position >= 0 && oppToken.position <= 50) {
        const oppGlobalIdx = getGlobalTrackIndex(oppColor, oppToken.position);
        if (oppGlobalIdx === globalTrackIdx) {
          // Capture opponent token!
          return { color: oppColor, id: oppToken.id };
        }
      }
    }
  }

  return null;
}

/**
 * Calculate step-by-step positions for smooth 60 FPS movement animation
 */
export function getMovementPath(fromPos: number, toPos: number): number[] {
  const path: number[] = [];
  if (fromPos === -1) {
    path.push(0); // Jump out of base directly to start cell
    return path;
  }

  for (let p = fromPos + 1; p <= toPos; p++) {
    path.push(p);
  }
  return path;
}

/**
 * Check if a player has brought all 4 tokens to home finish (position 56)
 */
export function checkPlayerFinished(tokens: TokenState[]): boolean {
  return tokens.every((t) => t.position === 56);
}

/**
 * Calculate a balanced, dynamic dice roll (1..6)
 * Incorporates:
 * 1. ~1 in 6 baseline probability with streak protection (boosted 6 after 4-5 rolls without 6)
 * 2. Dynamic catch-up balancing: players lagging behind get higher chance of rolling 6
 * 3. Climax & base unlock protection: players with tokens stuck in base while others advance get boost
 */
export function calculateFairDiceRoll(
  activeTurn: PlayerColor,
  tokens: Record<PlayerColor, TokenState[]>,
  turnsWithoutSix: Record<PlayerColor, number>,
  maxRollAllowed: number = 6
): number {
  // Base weights for outcomes [1, 2, 3, 4, 5, 6]
  // 100 base weight each = 100/600 = 16.67% (~1 in 6 chance)
  const weights = [100, 100, 100, 100, 100, 100];

  if (maxRollAllowed < 6) {
    weights[5] = 0; // Force 6 probability to 0 (roll max 1..5)
  }

  const streak = turnsWithoutSix[activeTurn] || 0;

  // 1. Unlucky streak protection (ensures a 6 roughly every ~5-6 rolls)
  if (streak >= 4) {
    // 4 rolls without 6 -> +40 bonus
    // 5 rolls without 6 -> +90 bonus
    // 6+ rolls without 6 -> +160 bonus (making 6 very likely)
    const streakBonus = streak === 4 ? 40 : streak === 5 ? 90 : 160;
    weights[5] += streakBonus;
  }

  // 2. Player progress & state assessment
  const playerTokens = tokens[activeTurn] || [];
  const playerInBase = playerTokens.filter((t) => t.position === -1).length;
  const playerFinished = playerTokens.filter((t) => t.position === 56).length;
  const playerProgress = playerTokens.reduce((sum, t) => {
    if (t.position === -1) return sum;
    return sum + t.position;
  }, 0);

  let maxOpponentProgress = 0;
  let leaderFinishedCount = 0;

  for (const [colKey, oppToks] of Object.entries(tokens)) {
    if (colKey === activeTurn) continue;
    const oppProg = oppToks.reduce((sum, t) => (t.position > 0 ? sum + t.position : sum), 0);
    const oppFinished = oppToks.filter((t) => t.position === 56).length;

    if (oppProg > maxOpponentProgress) {
      maxOpponentProgress = oppProg;
    }
    if (oppFinished > leaderFinishedCount) {
      leaderFinishedCount = oppFinished;
    }
  }

  // 3. Dynamic catch-up balancing
  const progressGap = maxOpponentProgress - playerProgress;

  // Case A: Player is lagging far behind in total progress
  if (progressGap > 20) {
    const gapBonus = Math.min(120, Math.floor((progressGap - 20) * 2.5));
    weights[5] += gapBonus;
  }

  // Case B: Player has tokens stuck in base while leader is advancing
  if (playerInBase >= 3 && maxOpponentProgress > 15) {
    weights[5] += 80;
  } else if (playerInBase === 4 && maxOpponentProgress > 5) {
    weights[5] += 110; // High chance to unlock first token when far behind
  }

  // Case C: Opponents have finished tokens while active player has 0 finished
  if (leaderFinishedCount > playerFinished && playerFinished === 0) {
    weights[5] += 50;
  }

  // Pick weighted random outcome
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let randomVal = Math.random() * totalWeight;

  for (let i = 0; i < 6; i++) {
    if (randomVal < weights[i]) {
      return i + 1;
    }
    randomVal -= weights[i];
  }

  return Math.floor(Math.random() * Math.min(6, maxRollAllowed)) + 1;
}

