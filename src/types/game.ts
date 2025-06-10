export interface Die {
  id: number;
  value: number;
  isHeld: boolean;
  isScoring: boolean;
  isLocked: boolean;
}

export interface Player {
  id: number;
  name: string;
  totalScore: number;
  turnScore: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dice: Die[];
  isRolling: boolean;
  canRoll: boolean;
  gameWinner: Player | null;
  targetScore: number;
  hasRolledThisTurn: boolean;
}

export interface GameSettings {
  playerCount: number;
  targetScore: number;
}

export type GameMode = 'menu' | 'playing';