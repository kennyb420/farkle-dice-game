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
  isAI?: boolean;
  aiDifficulty?: 'easy' | 'hard';
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
  isAITurn?: boolean;
  aiThinking?: boolean;
}

export interface GameSettings {
  playerCount: number;
  targetScore: number;
  gameMode: 'pvp' | 'pve';
  aiDifficulty?: 'easy' | 'hard';
}

export type GameMode = 'menu' | 'playing';