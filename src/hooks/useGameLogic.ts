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
        // Step 1: Lock any held dice and roll the rest
        const newDice = prev.dice.map(die => ({
          ...die,
          // Only roll dice that are NOT locked AND NOT held
          value: (die.isLocked || die.isHeld) ? die.value : Math.floor(Math.random() * 6) + 1,
          isScoring: false,
          // Lock any held dice permanently
          isLocked: die.isLocked || die.isHeld,
          // Clear held status since they're now locked
          isHeld: false
        }));

        // Step 2: Calculate score ONLY from dice that were just locked (previously held)
        const justLockedDice = prev.dice.filter(d => d.isHeld);
        let scoreToAdd = 0;
        
        if (justLockedDice.length > 0) {
          const { totalScore } = calculateScore(justLockedDice);
          scoreToAdd = totalScore;
        }

        // Step 3: Update player's turn score
        const newPlayers = [...prev.players];
        newPlayers[prev.currentPlayerIndex].turnScore += scoreToAdd;
        
        const availableDice = newDice.filter(d => !d.isLocked);

        // Step 4: Check if all dice are locked - if so, give fresh dice
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
            canRoll: false,
            hasRolledThisTurn: true,
            players: newPlayers
          };
        }

        // Step 5: Check for bust
        const hasScore = hasAnyScore(availableDice);
        if (!hasScore && availableDice.length > 0) {
          // Bust! Reset turn score to 0
          newPlayers[prev.currentPlayerIndex].turnScore = 0;

          return {
            ...prev,
            dice: newDice,
            isRolling: false,
            canRoll: false,
            players: newPlayers,
            hasRolledThisTurn: true
          };
        }

        return {
          ...prev,
          dice: newDice,
          isRolling: false,
          canRoll: false,
          hasRolledThisTurn: true,
          players: newPlayers
        };
      });
    }, 600);
  }, [gameState.canRoll, gameState.isRolling]);

  const toggleDie = useCallback((dieId: number) => {
    setGameState(prev => {
      if (!prev.hasRolledThisTurn) return prev;
      
      const newDice = prev.dice.map(die => {
        if (die.id === dieId && !die.isLocked) {
          return { 
            ...die, 
            isHeld: !die.isHeld
          };
        }
        return die;
      });

      const hasHeldDice = newDice.some(d => d.isHeld);
      
      return {
        ...prev,
        dice: newDice,
        canRoll: hasHeldDice
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const currentPlayer = newPlayers[prev.currentPlayerIndex];
      
      // ONLY add score from dice that are currently held (📌) but not yet locked
      const stillHeldDice = prev.dice.filter(d => d.isHeld && !d.isLocked);
      if (stillHeldDice.length > 0) {
        const { totalScore } = calculateScore(stillHeldDice);
        currentPlayer.turnScore += totalScore;
      }
      
      // Add the FINAL turn score to total score (this happens only once)
      currentPlayer.totalScore += currentPlayer.turnScore;
      
      // Check for winner
      const winner = currentPlayer.totalScore >= prev.targetScore ? currentPlayer : null;
      
      // Reset for next player
      currentPlayer.turnScore = 0;

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
    // This function is kept for compatibility
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
      canRoll: selectableDiceIds.length > 0
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