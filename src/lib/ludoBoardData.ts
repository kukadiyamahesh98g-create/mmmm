import { CellCoord, PlayerColor } from '../types/ludo';

/**
 * Official Symmetrical 15x15 Ludo Board Track (52 Main Path Cells)
 * Track starts at Red's exit cell (row 13, col 6) and circles clockwise.
 */
export const TRACK_CELLS: CellCoord[] = [
  /* 0  Red Start  */ { row: 13, col: 6 },
  /* 1             */ { row: 12, col: 6 },
  /* 2             */ { row: 11, col: 6 },
  /* 3             */ { row: 10, col: 6 },
  /* 4             */ { row: 9,  col: 6 },
  /* 5             */ { row: 8,  col: 5 },
  /* 6             */ { row: 8,  col: 4 },
  /* 7             */ { row: 8,  col: 3 },
  /* 8  Star       */ { row: 8,  col: 2 },
  /* 9             */ { row: 8,  col: 1 },
  /* 10            */ { row: 8,  col: 0 },
  /* 11            */ { row: 7,  col: 0 },
  /* 12            */ { row: 6,  col: 0 },
  /* 13 Green Start*/ { row: 6,  col: 1 },
  /* 14            */ { row: 6,  col: 2 },
  /* 15            */ { row: 6,  col: 3 },
  /* 16            */ { row: 6,  col: 4 },
  /* 17            */ { row: 6,  col: 5 },
  /* 18            */ { row: 5,  col: 6 },
  /* 19            */ { row: 4,  col: 6 },
  /* 20            */ { row: 3,  col: 6 },
  /* 21 Star       */ { row: 2,  col: 6 },
  /* 22            */ { row: 1,  col: 6 },
  /* 23            */ { row: 0,  col: 6 },
  /* 24            */ { row: 0,  col: 7 },
  /* 25            */ { row: 0,  col: 8 },
  /* 26 Yell Start */ { row: 1,  col: 8 },
  /* 27            */ { row: 2,  col: 8 },
  /* 28            */ { row: 3,  col: 8 },
  /* 29            */ { row: 4,  col: 8 },
  /* 30            */ { row: 5,  col: 8 },
  /* 31            */ { row: 6,  col: 9 },
  /* 32            */ { row: 6,  col: 10 },
  /* 33            */ { row: 6,  col: 11 },
  /* 34 Star       */ { row: 6,  col: 12 },
  /* 35            */ { row: 6,  col: 13 },
  /* 36            */ { row: 6,  col: 14 },
  /* 37            */ { row: 7,  col: 14 },
  /* 38            */ { row: 8,  col: 14 },
  /* 39 Blue Start */ { row: 8,  col: 13 },
  /* 40            */ { row: 8,  col: 12 },
  /* 41            */ { row: 8,  col: 11 },
  /* 42            */ { row: 8,  col: 10 },
  /* 43            */ { row: 8,  col: 9 },
  /* 44            */ { row: 9,  col: 8 },
  /* 45            */ { row: 10, col: 8 },
  /* 46            */ { row: 11, col: 8 },
  /* 47 Star       */ { row: 12, col: 8 },
  /* 48            */ { row: 13, col: 8 },
  /* 49            */ { row: 14, col: 8 },
  /* 50            */ { row: 14, col: 7 },
  /* 51            */ { row: 14, col: 6 },
];

/**
 * 8 Official Safe Track Indices (4 colored start cells + 4 star cells)
 */
export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

/**
 * Official Start index on 52-cell track for each color
 */
export const COLOR_START_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

/**
 * Home Stretches (5 cells leading into the center triangle)
 */
export const HOME_STRETCH: Record<PlayerColor, CellCoord[]> = {
  red: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9,  col: 7 },
  ],
  green: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  yellow: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  blue: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
};

/**
 * Final Home Finish Cell (Center Triangle tip for each color)
 */
export const HOME_FINISH: Record<PlayerColor, CellCoord> = {
  red: { row: 8, col: 7 },
  green: { row: 7, col: 6 },
  yellow: { row: 6, col: 7 },
  blue: { row: 7, col: 8 },
};

/**
 * Base Nest Coordinates (4 recessed slots inside 6x6 homes)
 */
export const BASE_NESTS: Record<PlayerColor, CellCoord[]> = {
  green: [
    { row: 1.5, col: 1.5 },
    { row: 1.5, col: 3.5 },
    { row: 3.5, col: 1.5 },
    { row: 3.5, col: 3.5 },
  ],
  yellow: [
    { row: 1.5, col: 10.5 },
    { row: 1.5, col: 12.5 },
    { row: 3.5, col: 10.5 },
    { row: 3.5, col: 12.5 },
  ],
  red: [
    { row: 10.5, col: 1.5 },
    { row: 10.5, col: 3.5 },
    { row: 12.5, col: 1.5 },
    { row: 12.5, col: 3.5 },
  ],
  blue: [
    { row: 10.5, col: 10.5 },
    { row: 10.5, col: 12.5 },
    { row: 12.5, col: 10.5 },
    { row: 12.5, col: 12.5 },
  ],
};

/**
 * Get exact 15x15 row,col coordinate for a token
 */
export function getTokenCoordinate(color: PlayerColor, position: number, tokenId: number): CellCoord {
  // Base (-1)
  if (position === -1) {
    return BASE_NESTS[color][tokenId] || BASE_NESTS[color][0];
  }
  // Track (0..50)
  if (position >= 0 && position <= 50) {
    const globalIndex = (COLOR_START_INDEX[color] + position) % 52;
    return TRACK_CELLS[globalIndex];
  }
  // Home Stretch (51..55)
  if (position >= 51 && position <= 55) {
    const stretchIdx = position - 51;
    return HOME_STRETCH[color][stretchIdx];
  }
  // Home Finish (56)
  return HOME_FINISH[color];
}

/**
 * Check if a global track index is safe
 */
export function isGlobalTrackSafe(globalTrackIndex: number): boolean {
  return SAFE_TRACK_INDICES.includes(globalTrackIndex);
}

/**
 * Get global track index for a token
 */
export function getGlobalTrackIndex(color: PlayerColor, position: number): number | null {
  if (position >= 0 && position <= 50) {
    return (COLOR_START_INDEX[color] + position) % 52;
  }
  return null;
}
