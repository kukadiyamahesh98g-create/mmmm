import { MoveOption, PlayerColor, TokenState } from '../types/ludo';
import {
  COLOR_START_INDEX,
  getGlobalTrackIndex,
  isGlobalTrackSafe,
} from './ludoBoardData';

/**
 * Advanced Strategic Human-Like Ludo AI Engine
 * Evaluates all legal moves by analyzing full board equity, simulating 1-turn outcomes,
 * computing exact threat probabilities, protecting advanced tokens, and optimizing board control.
 */
export function selectBestAiMove(
  aiColor: PlayerColor,
  validMoves: MoveOption[],
  allPlayerTokens: Record<PlayerColor, TokenState[]>
): MoveOption | null {
  if (!validMoves || validMoves.length === 0) return null;

  // If only 1 legal move, AI executes it
  if (validMoves.length === 1) return validMoves[0];

  const scoredMoves = validMoves.map((move) => {
    // 1. Simulate board state after executing candidate move
    const simulatedTokens = cloneTokensState(allPlayerTokens);
    applyMoveToSimulatedTokens(aiColor, move, simulatedTokens);

    // 2. Base board equity of AI state after move
    let score = evaluateBoardEquity(aiColor, simulatedTokens);

    // 3. Immediate tactical move bonuses & penalties
    const fromPos = move.fromPos;
    const toPos = move.toPos;
    const isFromSafe = isPosSafe(aiColor, fromPos);
    const isToSafe = isPosSafe(aiColor, toPos) || toPos >= 51;
    const isCurrentlyThreatened = isTokenThreatened(aiColor, fromPos, allPlayerTokens);
    const willBeThreatenedAfterMove = willBeThreatened(aiColor, toPos, simulatedTokens);

    // --- CAPTURE OPPONENT TOKEN (+45,000 to +75,000) ---
    if (move.isCapture && move.captureColor && move.captureTokenId !== undefined) {
      score += 45000;
      const oppTokens = allPlayerTokens[move.captureColor] || [];
      const capturedToken = oppTokens.find((t) => t.id === move.captureTokenId);
      const oppPos = capturedToken ? capturedToken.position : 0;

      // Bonus for capturing opponent tokens that have advanced far
      score += Math.pow(oppPos, 1.5) * 800;

      // Massive bonus for capturing the leader token on the board
      if (isLeadingOpponentToken(aiColor, oppPos, allPlayerTokens)) {
        score += 20000;
      }
    }

    // --- REACH HOME FINISH & ENTER HOME STRETCH (+25,000 to +65,000) ---
    if (toPos === 56) {
      score += 65000; // Finish token - top strategic goal
    } else if (toPos >= 51 && fromPos < 51) {
      score += 32000; // Enter 100% immune home stretch
    } else if (toPos >= 51) {
      score += 16000 + (toPos - 51) * 2200; // Progress within home stretch
    }

    // --- ESCAPE THREATENED TOKEN TO SAFETY (+20,000 to +40,000) ---
    if (isCurrentlyThreatened) {
      const advancedMultiplier = Math.pow(Math.max(1, fromPos), 1.3);
      if (isToSafe) {
        score += 26000 + advancedMultiplier * 400; // Escape directly to safe cell/stretch
      } else if (!willBeThreatenedAfterMove) {
        score += 19000 + advancedMultiplier * 300; // Escape out of enemy reach
      } else {
        score += 10000; // Advance even if still at risk
      }
    }

    // --- ADVANCED TOKEN PROTECTION & SAFE SPOT RETENTION ---
    const isAdvancedPiece = fromPos >= 18 && fromPos < 51;
    const isFarAdvancedPiece = fromPos >= 30 && fromPos < 51;

    // Strict Rule: Never release a safe advanced token without capture or entering home stretch
    if (isFromSafe && isAdvancedPiece) {
      if (move.isCapture) {
        score += 22000; // Capturing from safe spot is an ideal attack
      } else if (!isToSafe) {
        if (isFarAdvancedPiece) {
          score -= 52000; // Severe penalty for risking far advanced token
        } else {
          score -= 35000; // Heavy penalty for risking moderate advanced token
        }

        // Additional penalty if opponents are behind on the track
        if (isOpponentInBehindRange(aiColor, fromPos, allPlayerTokens)) {
          score -= 25000;
        }
      }
    }

    // --- RELEASING NEW TOKENS FROM BASE (+8,000 to +30,000) ---
    if (move.isLeavingBase) {
      const activeTokensOnTrack = allPlayerTokens[aiColor].filter(
        (t) => t.position >= 0 && t.position < 51
      ).length;
      const safeOrFinishedTokens = allPlayerTokens[aiColor].filter(
        (t) => t.position >= 51 || (t.position > 0 && isPosSafe(aiColor, t.position))
      ).length;

      if (activeTokensOnTrack === 0) {
        score += 30000; // Must bring first token out
      } else if (safeOrFinishedTokens >= 1) {
        // Advanced tokens are safe/finished -> excellent time to bring out another token
        score += 24000;
      } else if (activeTokensOnTrack === 1) {
        score += 15000;
      } else if (activeTokensOnTrack === 2) {
        score += 9000;
      } else {
        score += 5000;
      }
    }

    // --- LANDING ON SAFE STAR/START CELLS (+14,000) ---
    if (isPosSafe(aiColor, toPos) && toPos > 0 && toPos < 51) {
      score += 14000;
    }

    // --- STACKING / BLOCKADE WITH FRIENDLY TOKEN (+9,000) ---
    const friendlyCountOnTarget = simulatedTokens[aiColor].filter(
      (t) => t.id !== move.tokenId && t.position === toPos && toPos > 0 && toPos < 51
    ).length;
    if (friendlyCountOnTarget > 0) {
      score += 9000;
    }

    // --- THREATENING OPPONENT / AMBUSH POSITION (+10,000) ---
    if (!move.isCapture && canThreatenOpponent(aiColor, toPos, simulatedTokens)) {
      score += 10000;
    }

    const isAmbushPosition = isAmbushOrCampSpot(aiColor, fromPos, allPlayerTokens);
    if (isAmbushPosition && !move.isCapture && toPos < 51 && !isCurrentlyThreatened && !move.isLeavingBase) {
      // Hold safe ambush spot over opponent base exit
      score -= 18000;
    }

    // --- VULNERABILITY PENALTY FOR UNPROTECTED LANDING (-22,000) ---
    if (!isToSafe && willBeThreatenedAfterMove) {
      const vulnerabilityWeight = Math.pow(Math.max(1, toPos), 1.4) * 400;
      score -= (22000 + vulnerabilityWeight);
    }

    // --- TRAILING TOKEN ADVANCEMENT BONUS ---
    if (toPos > 0 && toPos < 51) {
      const activePositions = simulatedTokens[aiColor]
        .filter((t) => t.position >= 0 && t.position < 51)
        .map((t) => t.position);
      if (activePositions.length > 1) {
        const minPos = Math.min(...activePositions);
        if (fromPos === minPos) {
          score += 7000; // Keep trailing tokens supported
        }
      }
    }

    // --- 4. SIMULATED OPPONENT RESPONSES (1-TURN EXPECTIMAX LOOKAHEAD) ---
    const expectedOpponentThreatPenalty = evaluateOpponentResponseThreats(aiColor, simulatedTokens);
    score -= expectedOpponentThreatPenalty;

    return { move, score };
  });

  // Sort moves by score descending
  scoredMoves.sort((a, b) => b.score - a.score);

  return scoredMoves[0].move;
}

/**
 * Clone tokens state object for lookahead simulation
 */
function cloneTokensState(
  tokens: Record<PlayerColor, TokenState[]>
): Record<PlayerColor, TokenState[]> {
  const cloned: Record<PlayerColor, TokenState[]> = {
    red: [],
    green: [],
    yellow: [],
    blue: [],
  };

  for (const [col, list] of Object.entries(tokens)) {
    cloned[col as PlayerColor] = list.map((t) => ({ ...t }));
  }

  return cloned;
}

/**
 * Apply candidate move to a simulated board state
 */
function applyMoveToSimulatedTokens(
  color: PlayerColor,
  move: MoveOption,
  tokens: Record<PlayerColor, TokenState[]>
) {
  // Update AI token
  const playerList = tokens[color] || [];
  const token = playerList.find((t) => t.id === move.tokenId);
  if (token) {
    token.position = move.toPos;
  }

  // Handle capture
  if (move.isCapture && move.captureColor && move.captureTokenId !== undefined) {
    const oppList = tokens[move.captureColor] || [];
    const oppToken = oppList.find((t) => t.id === move.captureTokenId);
    if (oppToken) {
      oppToken.position = -1; // Sent back to base
    }
  }
}

/**
 * Evaluate net board equity for the AI player versus all opponents
 */
function evaluateBoardEquity(
  aiColor: PlayerColor,
  tokens: Record<PlayerColor, TokenState[]>
): number {
  let aiTotalScore = 0;
  let opponentMaxScore = 0;

  for (const [colKey, list] of Object.entries(tokens)) {
    const color = colKey as PlayerColor;
    let colorScore = 0;

    for (const t of list) {
      if (t.position === -1) {
        colorScore += 0;
      } else if (t.position === 56) {
        colorScore += 100000;
      } else if (t.position >= 51) {
        colorScore += 50000 + (t.position - 51) * 4000;
      } else {
        colorScore += t.position * 350;
        if (isPosSafe(color, t.position)) {
          colorScore += 12000;
        }
      }
    }

    if (color === aiColor) {
      aiTotalScore = colorScore;
    } else {
      if (colorScore > opponentMaxScore) {
        opponentMaxScore = colorScore;
      }
    }
  }

  return aiTotalScore - opponentMaxScore * 0.4;
}

/**
 * Calculate expected threat penalties from possible opponent rolls on their next turn
 */
function evaluateOpponentResponseThreats(
  aiColor: PlayerColor,
  tokens: Record<PlayerColor, TokenState[]>
): number {
  let totalPenalty = 0;
  const aiTokens = tokens[aiColor] || [];

  for (const aiToken of aiTokens) {
    if (aiToken.position < 0 || aiToken.position >= 51) continue;
    const aiGlobalIdx = getGlobalTrackIndex(aiColor, aiToken.position);
    if (aiGlobalIdx === null || isGlobalTrackSafe(aiGlobalIdx)) continue;

    for (const [oppColorKey, oppList] of Object.entries(tokens)) {
      const oppColor = oppColorKey as PlayerColor;
      if (oppColor === aiColor) continue;

      for (const oppToken of oppList) {
        if (oppToken.position < 0 || oppToken.position >= 51) continue;
        const oppGlobalIdx = getGlobalTrackIndex(oppColor, oppToken.position);
        if (oppGlobalIdx === null) continue;

        const dist = (aiGlobalIdx - oppGlobalIdx + 52) % 52;
        if (dist >= 1 && dist <= 6) {
          // Opponent has 1/6 probability of rolling the exact distance to capture AI token
          const prob = 1 / 6;
          const threatVal = 35000 + Math.pow(aiToken.position, 1.5) * 500;
          totalPenalty += prob * threatVal;
        }
      }
    }
  }

  return totalPenalty;
}

/**
 * Check if a position is safe (Base, Home Stretch, or Safe Star/Start Cell)
 */
function isPosSafe(color: PlayerColor, position: number): boolean {
  if (position < 0) return true; // Base is safe
  if (position >= 51) return true; // Home stretch & finish are safe
  const globalTrackIdx = getGlobalTrackIndex(color, position);
  if (globalTrackIdx === null) return false;
  return isGlobalTrackSafe(globalTrackIdx);
}

/**
 * Check if a token at current position is threatened by an opponent within 1..6 steps behind
 */
function isTokenThreatened(
  color: PlayerColor,
  position: number,
  allPlayerTokens: Record<PlayerColor, TokenState[]>
): boolean {
  if (position < 0 || position >= 51) return false;
  const globalIdx = getGlobalTrackIndex(color, position);
  if (globalIdx === null || isGlobalTrackSafe(globalIdx)) return false;

  for (const [oppColorKey, oppTokens] of Object.entries(allPlayerTokens)) {
    const oppColor = oppColorKey as PlayerColor;
    if (oppColor === color) continue;

    for (const oppToken of oppTokens) {
      if (oppToken.position < 0 || oppToken.position >= 51) continue;
      const oppGlobalIdx = getGlobalTrackIndex(oppColor, oppToken.position);
      if (oppGlobalIdx === null) continue;

      const distance = (globalIdx - oppGlobalIdx + 52) % 52;
      if (distance >= 1 && distance <= 6) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if an opponent is 1..6 steps behind a given position
 */
function isOpponentInBehindRange(
  color: PlayerColor,
  position: number,
  allPlayerTokens: Record<PlayerColor, TokenState[]>
): boolean {
  if (position < 0 || position >= 51) return false;
  const globalIdx = getGlobalTrackIndex(color, position);
  if (globalIdx === null) return false;

  for (const [oppColorKey, oppTokens] of Object.entries(allPlayerTokens)) {
    const oppColor = oppColorKey as PlayerColor;
    if (oppColor === color) continue;

    for (const oppToken of oppTokens) {
      if (oppToken.position < 0 || oppToken.position >= 51) continue;
      const oppGlobalIdx = getGlobalTrackIndex(oppColor, oppToken.position);
      if (oppGlobalIdx === null) continue;

      const distance = (globalIdx - oppGlobalIdx + 52) % 52;
      if (distance >= 1 && distance <= 6) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if landing on `toPos` will place the token in threat from any opponent within 1..6 steps
 */
function willBeThreatened(
  color: PlayerColor,
  toPos: number,
  allPlayerTokens: Record<PlayerColor, TokenState[]>
): boolean {
  if (toPos < 0 || toPos >= 51) return false;
  const globalIdx = getGlobalTrackIndex(color, toPos);
  if (globalIdx === null || isGlobalTrackSafe(globalIdx)) return false;

  for (const [oppColorKey, oppTokens] of Object.entries(allPlayerTokens)) {
    const oppColor = oppColorKey as PlayerColor;
    if (oppColor === color) continue;

    for (const oppToken of oppTokens) {
      if (oppToken.position < 0 || oppToken.position >= 51) continue;
      const oppGlobalIdx = getGlobalTrackIndex(oppColor, oppToken.position);
      if (oppGlobalIdx === null) continue;

      const distance = (globalIdx - oppGlobalIdx + 52) % 52;
      if (distance >= 1 && distance <= 6) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if moving to `toPos` places us 1..6 steps behind an opponent token to threaten them
 */
function canThreatenOpponent(
  color: PlayerColor,
  toPos: number,
  allPlayerTokens: Record<PlayerColor, TokenState[]>
): boolean {
  if (toPos < 0 || toPos >= 51) return false;
  const globalIdx = getGlobalTrackIndex(color, toPos);
  if (globalIdx === null) return false;

  for (const [oppColorKey, oppTokens] of Object.entries(allPlayerTokens)) {
    const oppColor = oppColorKey as PlayerColor;
    if (oppColor === color) continue;

    for (const oppToken of oppTokens) {
      if (oppToken.position < 0 || oppToken.position >= 51) continue;
      const oppGlobalIdx = getGlobalTrackIndex(oppColor, oppToken.position);
      if (oppGlobalIdx === null) continue;

      const distance = (oppGlobalIdx - globalIdx + 52) % 52;
      if (distance >= 1 && distance <= 6) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if an opponent token at `toPos` is a leading opponent token on the board
 */
function isLeadingOpponentToken(
  aiColor: PlayerColor,
  toPos: number,
  allPlayerTokens: Record<PlayerColor, TokenState[]>
): boolean {
  let maxOppPos = 0;
  for (const [oppColorKey, oppTokens] of Object.entries(allPlayerTokens)) {
    if (oppColorKey === aiColor) continue;
    for (const t of oppTokens) {
      if (t.position > maxOppPos && t.position < 56) {
        maxOppPos = t.position;
      }
    }
  }
  return toPos >= maxOppPos && maxOppPos > 0;
}

/**
 * Check if a safe tile position acts as an Ambush / Camping spot over an opponent
 */
function isAmbushOrCampSpot(
  aiColor: PlayerColor,
  position: number,
  allPlayerTokens: Record<PlayerColor, TokenState[]>
): boolean {
  if (position < 0 || position >= 51) return false;
  const globalIdx = getGlobalTrackIndex(aiColor, position);
  if (globalIdx === null || !isGlobalTrackSafe(globalIdx)) return false;

  for (const [oppColorKey, oppTokens] of Object.entries(allPlayerTokens)) {
    const oppColor = oppColorKey as PlayerColor;
    if (oppColor === aiColor) continue;

    const hasTokensInBase = oppTokens.some((t) => t.position === -1);
    if (!hasTokensInBase) continue;

    const oppStartGlobalIdx = COLOR_START_INDEX[oppColor];
    const distToOppStart = (oppStartGlobalIdx - globalIdx + 52) % 52;
    if (distToOppStart <= 6 || distToOppStart === 51 || distToOppStart === 50) {
      return true;
    }
  }

  return false;
}
