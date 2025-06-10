import { useState, useCallback } from 'react';
import { GameState, Die, Player, GameSettings, GameMode } from '../types/game';
import { calculateScore, hasAnyScore, getAutoSelectableDice } from '../utils/scoring';

export function useGameLogic() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialDice: Die[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      isHeld: false,
      isScoring: false,
      isLocked: false
    }));

    return {
      players: [],
      currentPlayerIndex: 0,
      dice: initialDice,
      isRolling: false,
      canRoll: true,
      gameWinner: null,
      targetScore: 10000,
      hasRolledThisTurn: false
    };
  });

  const startGame = useCallback((settings: GameSettings) => {
    const players: Player[] = Array.from({ length: settings.playerCount }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      totalScore: 0,
      turnScore: 0
    }));

    const initialDice: Die[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      isHeld: false,
      isScoring: false,
      isLocked: false
    }));

    setGameState({
      players,
      currentPlayerIndex: 0,
      dice: initialDice,
      isRolling: false,
      canRoll: true,
      gameWinner: null,
      targetScore: settings.targetScore,
      hasRolledThisTurn: false
    });

    setGameMode('playing');
  }, []);

  const returnToMenu = useCallback(() => {
    setGameMode('menu');
  }, []);

  const rollDice = useCallback(() => {
    if (!gameState.canRoll || gameState.isRolling) return;

    setGameState(prev => ({ ...prev, isRolling: true }));

    setTimeout(() => {
      setGameState(prev => {
        // Identify which dice were held before this roll
        const previouslyHeldDice = prev.dice.filter(d => d.isHeld);
        
        // Permanently lock all currently held dice and roll ONLY unlocked dice
        const newDice = prev.dice.map(die => ({
          ...die,
          // CRITICAL: Only roll dice that are NOT locked AND NOT held
          value: (die.isLocked || die.isHeld) ? die.value : Math.floor(Math.random() * 6) + 1,
          isScoring: false,
          isLocked: die.isHeld || die.isLocked, // Lock any held dice permanently
          isHeld: false // Clear held status since they're now locked
        }));

        // CRITICAL: Calculate score ONLY for dice that were just locked (previously held)
        const { totalScore: newRollScore } = calculateScore(previouslyHeldDice);
        
        // Add this roll's score to the existing turn score
        const newPlayers = [...prev.players];
        newPlayers[prev.currentPlayerIndex].turnScore += newRollScore;

        const availableDice = newDice.filter(d => !d.isLocked);

        // Check if all dice are locked - if so, give fresh dice
        if (availableDice.length === 0) {
          const freshDice: Die[] = Array.from({ length: 6 }, (_, i) => ({
            id: i,
            value: Math.floor(Math.random() * 6) + 1,
            isHeld: false,
            isScoring: false,
            isLocked: false
          }));

          return {
            ...prev,
            dice: freshDice,
            isRolling: false,
            canRoll: false, // Player must select dice before rolling again
            hasRolledThisTurn: true,
            players: newPlayers
          };
        }

        const hasScore = hasAnyScore(availableDice);

        if (!hasScore && availableDice.length > 0) {
          // Bust! End turn with no points - reset turn score to 0
          const bustPlayers = [...prev.players];
          bustPlayers[prev.currentPlayerIndex].turnScore = 0;

          return {
            ...prev,
            dice: newDice,
            isRolling: false,
            canRoll: false,
            players: bustPlayers,
            hasRolledThisTurn: true
          };
        }

        return {
          ...prev,
          dice: newDice,
          isRolling: false,
          canRoll: false, // Player must select dice before rolling again
          hasRolledThisTurn: true,
          players: newPlayers
        };
      });
    }, 600);
  }, [gameState.canRoll, gameState.isRolling]);

  const toggleDie = useCallback((dieId: number) => {
    setGameState(prev => {
      // Only allow toggling if the die is not permanently locked and player has rolled this turn
      if (!prev.hasRolledThisTurn) return prev;
      
      const newDice = prev.dice.map(die => {
        if (die.id === dieId && !die.isLocked) {
          // Toggle held status - dice are NOT locked until roll button is pressed
          return { 
            ...die, 
            isHeld: !die.isHeld
          };
        }
        return die;
      });

      // Check if player has any held dice - if so, allow rolling again
      const hasHeldDice = newDice.some(d => d.isHeld);
      
      return {
        ...prev,
        dice: newDice,
        canRoll: hasHeldDice // Can only roll if dice are held (selected)
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const currentPlayer = newPlayers[prev.currentPlayerIndex];
      
      // CRITICAL: Score any remaining held dice before ending turn
      const heldDice = prev.dice.filter(d => d.isHeld);
      if (heldDice.length > 0) {
        const { totalScore: finalRollScore } = calculateScore(heldDice);
        currentPlayer.turnScore += finalRollScore;
      }
      
      // Add turn score to total score ONLY ONCE
      currentPlayer.totalScore += currentPlayer.turnScore;
      
      // Check for winner AFTER adding the score
      const winner = currentPlayer.totalScore >= prev.targetScore ? currentPlayer : null;
      
      // Reset turn score for next player
      currentPlayer.turnScore = 0;

      // Reset dice for next player
      const newDice: Die[] = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        value: Math.floor(Math.random() * 6) + 1,
        isHeld: false,
        isScoring: false,
        isLocked: false
      }));

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: winner ? prev.currentPlayerIndex : (prev.currentPlayerIndex + 1) % prev.players.length,
        dice: newDice,
        canRoll: true,
        gameWinner: winner,
        hasRolledThisTurn: false
      };
    });
  }, []);

  const calculateTurnScore = useCallback(() => {
    // This function is kept for compatibility but the actual scoring
    // happens in rollDice and endTurn functions
  }, []);

  const autoSelectScoring = useCallback(() => {
    if (!gameState.hasRolledThisTurn) return;
    
    const availableDice = gameState.dice.filter(d => !d.isHeld && !d.isLocked);
    const selectableDiceIds = getAutoSelectableDice(availableDice);
    
    setGameState(prev => ({
      ...prev,
      dice: prev.dice.map(die => ({
        ...die,
        isHeld: die.isHeld || die.isLocked || selectableDiceIds.includes(die.id),
        isScoring: selectableDiceIds.includes(die.id)
      })),
      canRoll: selectableDiceIds.length > 0 // Can roll if dice were selected
    }));
  }, [gameState.dice, gameState.hasRolledThisTurn]);

  const startNewGame = useCallback(() => {
    setGameMode('menu');
  }, []);

  return {
    gameMode,
    gameState,
    startGame,
    returnToMenu,
    rollDice,
    toggleDie,
    endTurn,
    calculateTurnScore,
    autoSelectScoring,
    startNewGame
  };
}