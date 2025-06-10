export interface Die {
  id: number;
  value: number;
  isHeld: boolean;
  isScoring: boolean;
  isLocked: boolean; // New property for permanently locked dice
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
  hasRolledThisTurn: boolean; // Track if player has rolled this turn
}

export interface ScoringCombination {
  dice: number[];
  points: number;
  description: string;
}