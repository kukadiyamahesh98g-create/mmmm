export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type GameScreen = 
  | 'splash'
  | 'home'
  | 'play'
  | 'pause'
  | 'win'
  | 'lose';

export interface TokenState {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  // position: -1 = Base, 0-50 = Track relative to color start, 51-55 = Home Stretch, 56 = Home Finish
  position: number;
}

export interface PlayerConfig {
  color: PlayerColor;
  name: string;
  isAI: boolean;
  tokens: TokenState[];
  hasFinished: boolean;
  finishRank?: number;
}

export interface MoveOption {
  tokenId: number;
  fromPos: number;
  toPos: number;
  isCapture: boolean;
  isEnteringHome: boolean;
  isLeavingBase: boolean;
  captureColor?: PlayerColor;
  captureTokenId?: number;
  score?: number; // Used by Hard AI
}

export interface GameStats {
  turnsCount: number;
  sixesRolled: number;
  capturesMade: number;
  tokensHome: number;
  startTime: number;
  endTime?: number;
}

export interface CellCoord {
  row: number; // 0..14
  col: number; // 0..14
}
