export interface Die {
  id: number;
  value: number;
  isHeld: boolean;
  isScoring: boolean;
  isLocked: boolean;
  lockGroup?: number; // Track which roll this die was locked in
}

export interface Player {
  id: number;
  name: string;
  totalScore: number;
  turnScore: number;
  turnCombinations: ScoringCombination[]; // Track all combinations this turn
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
  currentLockGroup: number; // Track which roll we're on
}

export interface ScoringCombination {
  dice: number[];
  points: number;
  description: string;
  lockGroup: number; // Which roll this combination came from
}