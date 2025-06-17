import { GameSettings } from '../types/game';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// Validate game settings
export function validateGameSettings(settings: Partial<GameSettings>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate player count
  if (settings.playerCount !== undefined) {
    if (!Number.isInteger(settings.playerCount)) {
      errors.push('Player count must be a whole number');
    } else if (settings.playerCount < 2) {
      errors.push('At least 2 players are required');
    } else if (settings.playerCount > 5) {
      errors.push('Maximum 5 players allowed');
    }
  }

  // Validate target score
  if (settings.targetScore !== undefined) {
    if (!Number.isInteger(settings.targetScore)) {
      errors.push('Target score must be a whole number');
    } else if (settings.targetScore < 1000) {
      errors.push('Target score must be at least 1,000 points');
    } else if (settings.targetScore > 100000) {
      errors.push('Target score cannot exceed 100,000 points');
    } else if (settings.targetScore < 5000) {
      warnings.push('Games with target scores below 5,000 may be very short');
    } else if (settings.targetScore > 50000) {
      warnings.push('Games with target scores above 50,000 may take a very long time');
    }
  }

  // Validate game mode
  if (settings.gameMode !== undefined) {
    if (!['pvp', 'pve'].includes(settings.gameMode)) {
      errors.push('Invalid game mode selected');
    }
  }

  // Validate AI difficulty
  if (settings.aiDifficulty !== undefined) {
    if (!['easy', 'hard'].includes(settings.aiDifficulty)) {
      errors.push('Invalid AI difficulty selected');
    }
  }

  // Cross-validation
  if (settings.gameMode === 'pve' && settings.playerCount && settings.playerCount !== 2) {
    warnings.push('Player vs AI mode only supports 2 players');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Validate numeric input
export function validateNumericInput(
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value.trim() === '') {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors, warnings };
  }

  const numValue = parseInt(value, 10);

  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (numValue < min) {
    errors.push(`${fieldName} must be at least ${min.toLocaleString()}`);
  } else if (numValue > max) {
    errors.push(`${fieldName} cannot exceed ${max.toLocaleString()}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Sanitize user input
export function sanitizeInput(input: string, maxLength: number = 100): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML characters
}

// Validate player name
export function validatePlayerName(name: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sanitized = sanitizeInput(name, 20);

  if (sanitized.length === 0) {
    errors.push('Player name cannot be empty');
  } else if (sanitized.length < 2) {
    warnings.push('Player name is very short');
  } else if (sanitized !== name) {
    warnings.push('Player name was modified to remove invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Safe number parsing with fallback
export function safeParseInt(value: string | number, fallback: number): number {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : fallback;
  }

  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? fallback : parsed;
}

// Validate game state integrity
export function validateGameState(gameState: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check required properties
    if (!gameState.players || !Array.isArray(gameState.players)) {
      errors.push('Invalid players data');
    } else if (gameState.players.length < 2) {
      errors.push('Game must have at least 2 players');
    }

    if (!gameState.dice || !Array.isArray(gameState.dice)) {
      errors.push('Invalid dice data');
    } else if (gameState.dice.length !== 6) {
      errors.push('Game must have exactly 6 dice');
    }

    if (typeof gameState.currentPlayerIndex !== 'number') {
      errors.push('Invalid current player index');
    } else if (gameState.currentPlayerIndex < 0 || 
               gameState.currentPlayerIndex >= gameState.players?.length) {
      errors.push('Current player index out of bounds');
    }

    if (typeof gameState.targetScore !== 'number' || gameState.targetScore < 1000) {
      errors.push('Invalid target score');
    }

    // Validate dice values
    if (gameState.dice && Array.isArray(gameState.dice)) {
      gameState.dice.forEach((die: any, index: number) => {
        if (!die || typeof die.value !== 'number' || die.value < 1 || die.value > 6) {
          errors.push(`Invalid dice value at position ${index + 1}`);
        }
      });
    }

    // Validate player scores
    if (gameState.players && Array.isArray(gameState.players)) {
      gameState.players.forEach((player: any, index: number) => {
        if (!player || typeof player.totalScore !== 'number' || player.totalScore < 0) {
          errors.push(`Invalid total score for player ${index + 1}`);
        }
        if (typeof player.turnScore !== 'number' || player.turnScore < 0) {
          errors.push(`Invalid turn score for player ${index + 1}`);
        }
      });
    }

  } catch (error) {
    errors.push('Game state is corrupted');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}