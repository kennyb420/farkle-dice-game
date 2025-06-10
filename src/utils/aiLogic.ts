import { Die, Player } from '../types/game';
import { calculateScore, hasAnyScore, getAutoSelectableDice } from './scoring';

export interface AIDecision {
  action: 'roll' | 'endTurn' | 'selectDice';
  diceToSelect?: number[];
  reasoning?: string;
}

export class AIPlayer {
  private difficulty: 'easy' | 'hard';
  private player: Player;

  constructor(player: Player, difficulty: 'easy' | 'hard') {
    this.difficulty = difficulty;
    this.player = player;
  }

  // Main decision-making function
  makeDecision(dice: Die[], hasRolledThisTurn: boolean, targetScore: number, opponentScore: number): AIDecision {
    if (!hasRolledThisTurn) {
      return { action: 'roll', reasoning: 'Starting turn with a roll' };
    }

    const availableDice = dice.filter(d => !d.isLocked && !d.isHeld);
    const heldDice = dice.filter(d => d.isHeld || d.isLocked);
    
    // If no available dice to select, must roll or end turn
    if (availableDice.length === 0) {
      return this.decideRollOrEnd(heldDice, targetScore, opponentScore);
    }

    // Check if there are scoring dice available
    const scoringDiceIds = getAutoSelectableDice(availableDice);
    
    if (scoringDiceIds.length === 0) {
      // No scoring dice available - this shouldn't happen if we can make decisions
      return { action: 'endTurn', reasoning: 'No scoring dice available' };
    }

    // Decide which dice to select
    return this.selectScoringDice(dice, scoringDiceIds, targetScore, opponentScore);
  }

  private selectScoringDice(dice: Die[], scoringDiceIds: number[], targetScore: number, opponentScore: number): AIDecision {
    const availableDice = dice.filter(d => !d.isLocked && !d.isHeld);
    
    if (this.difficulty === 'easy') {
      return this.easyDiceSelection(availableDice, scoringDiceIds);
    } else {
      return this.hardDiceSelection(availableDice, scoringDiceIds, targetScore, opponentScore);
    }
  }

  private easyDiceSelection(availableDice: Die[], scoringDiceIds: number[]): AIDecision {
    // Easy AI makes suboptimal choices sometimes
    const shouldMakeMistake = Math.random() < 0.3; // 30% chance of mistake
    
    if (shouldMakeMistake && scoringDiceIds.length > 1) {
      // Select fewer dice than optimal (but at least one)
      const numToSelect = Math.max(1, Math.floor(scoringDiceIds.length * 0.6));
      const selectedDice = scoringDiceIds.slice(0, numToSelect);
      return {
        action: 'selectDice',
        diceToSelect: selectedDice,
        reasoning: 'Easy AI making conservative choice'
      };
    }

    // Usually select all scoring dice
    return {
      action: 'selectDice',
      diceToSelect: scoringDiceIds,
      reasoning: 'Easy AI selecting available scoring dice'
    };
  }

  private hardDiceSelection(availableDice: Die[], scoringDiceIds: number[], targetScore: number, opponentScore: number): AIDecision {
    // Hard AI analyzes the situation more carefully
    const currentTurnScore = this.player.turnScore;
    const totalIfEndNow = this.player.totalScore + currentTurnScore;
    const pointsNeeded = targetScore - this.player.totalScore;
    const isCloseToWinning = pointsNeeded <= 1000;
    const opponentIsClose = (targetScore - opponentScore) <= 1000;

    // Always select all available scoring dice for maximum efficiency
    return {
      action: 'selectDice',
      diceToSelect: scoringDiceIds,
      reasoning: 'Hard AI selecting all scoring dice for optimal play'
    };
  }

  private decideRollOrEnd(heldDice: Die[], targetScore: number, opponentScore: number): AIDecision {
    const currentTurnScore = this.player.turnScore;
    const totalIfEndNow = this.player.totalScore + currentTurnScore;
    const pointsNeeded = targetScore - this.player.totalScore;
    const isCloseToWinning = pointsNeeded <= 1000;
    const opponentIsClose = (targetScore - opponentScore) <= 1000;

    if (this.difficulty === 'easy') {
      return this.easyRollOrEndDecision(currentTurnScore, totalIfEndNow, targetScore, isCloseToWinning);
    } else {
      return this.hardRollOrEndDecision(currentTurnScore, totalIfEndNow, targetScore, pointsNeeded, opponentIsClose, isCloseToWinning);
    }
  }

  private easyRollOrEndDecision(currentTurnScore: number, totalIfEndNow: number, targetScore: number, isCloseToWinning: boolean): AIDecision {
    // Easy AI is more conservative and makes some poor decisions
    
    // If can win, always end turn
    if (totalIfEndNow >= targetScore) {
      return { action: 'endTurn', reasoning: 'Easy AI can win this turn' };
    }

    // Conservative thresholds
    if (currentTurnScore >= 800) {
      return { action: 'endTurn', reasoning: 'Easy AI being conservative with good score' };
    }

    if (currentTurnScore >= 400 && Math.random() < 0.4) {
      return { action: 'endTurn', reasoning: 'Easy AI randomly being cautious' };
    }

    if (currentTurnScore >= 200 && Math.random() < 0.2) {
      return { action: 'endTurn', reasoning: 'Easy AI making overly conservative choice' };
    }

    return { action: 'roll', reasoning: 'Easy AI continuing to roll' };
  }

  private hardRollOrEndDecision(
    currentTurnScore: number, 
    totalIfEndNow: number, 
    targetScore: number, 
    pointsNeeded: number,
    opponentIsClose: boolean,
    isCloseToWinning: boolean
  ): AIDecision {
    // Hard AI uses sophisticated decision making
    
    // If can win, always end turn
    if (totalIfEndNow >= targetScore) {
      return { action: 'endTurn', reasoning: 'Hard AI can win this turn' };
    }

    // If very close to winning, be more aggressive
    if (isCloseToWinning && currentTurnScore >= pointsNeeded * 0.5) {
      if (Math.random() < 0.7) { // 70% chance to continue when close
        return { action: 'roll', reasoning: 'Hard AI being aggressive near victory' };
      }
    }

    // If opponent is close to winning, be more aggressive
    if (opponentIsClose && currentTurnScore < 600) {
      return { action: 'roll', reasoning: 'Hard AI being aggressive due to opponent threat' };
    }

    // Standard risk assessment
    const bustRisk = this.calculateBustRisk(currentTurnScore);
    const shouldContinue = Math.random() < (1 - bustRisk);

    if (currentTurnScore >= 1000) {
      return { action: 'endTurn', reasoning: 'Hard AI satisfied with excellent score' };
    }

    if (currentTurnScore >= 600 && !shouldContinue) {
      return { action: 'endTurn', reasoning: 'Hard AI managing risk with good score' };
    }

    if (currentTurnScore >= 300 && bustRisk > 0.6) {
      return { action: 'endTurn', reasoning: 'Hard AI avoiding high bust risk' };
    }

    return { action: 'roll', reasoning: 'Hard AI calculated risk as acceptable' };
  }

  private calculateBustRisk(currentTurnScore: number): number {
    // Estimate bust probability based on current score and typical game patterns
    // Higher current score = higher risk tolerance, but also higher bust probability
    
    if (currentTurnScore < 200) return 0.2;
    if (currentTurnScore < 400) return 0.35;
    if (currentTurnScore < 600) return 0.5;
    if (currentTurnScore < 800) return 0.65;
    return 0.8;
  }

  // Get a delay for AI actions to make it feel more natural
  getActionDelay(): number {
    if (this.difficulty === 'easy') {
      return 1000 + Math.random() * 1500; // 1-2.5 seconds
    } else {
      return 1500 + Math.random() * 2000; // 1.5-3.5 seconds (thinking harder)
    }
  }
}