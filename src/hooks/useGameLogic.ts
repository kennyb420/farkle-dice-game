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
      hasRolledThisTurn: false,
      currentLockGroup: 0
    };
  });

  const startGame = useCallback((settings: GameSettings) => {
    const players: Player[] = Array.from({ length: settings.playerCount }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      totalScore: 0,
      turnScore: 0,
      turnCombinations: [],
      scoreHistory: []
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
      hasRolledThisTurn: false,
      currentLockGroup: 0
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
        // Permanently lock all currently held dice and roll ONLY unlocked dice
        const newDice = prev.dice.map(die => ({
          ...die,
          // CRITICAL: Only roll dice that are NOT locked AND NOT held
          value: (die.isLocked || die.isHeld) ? die.value : Math.floor(Math.random() * 6) + 1,
          isScoring: false,
          isLocked: die.isHeld || die.isLocked, // Lock any held dice permanently
          isHeld: false, // Clear held status since they're now locked
          lockGroup: die.isHeld ? prev.currentLockGroup : die.lockGroup // Assign lock group to newly locked dice
        }));

        // Calculate scoring for newly locked dice only
        const newlyLockedDice = newDice.filter(d => d.lockGroup === prev.currentLockGroup);
        const { combinations } = calculateScore(newlyLockedDice);
        
        // Add lock group to combinations
        const combinationsWithGroup = combinations.map(combo => ({
          ...combo,
          lockGroup: prev.currentLockGroup
        }));

        // Update player's turn combinations
        const newPlayers = [...prev.players];
        const currentPlayer = newPlayers[prev.currentPlayerIndex];
        currentPlayer.turnCombinations = [...currentPlayer.turnCombinations, ...combinationsWithGroup];
        
        // Calculate total turn score from all combinations
        currentPlayer.turnScore = currentPlayer.turnCombinations.reduce((total, combo) => total + combo.points, 0);

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
            players: newPlayers,
            currentLockGroup: prev.currentLockGroup + 1
          };
        }

        const hasScore = hasAnyScore(availableDice);

        if (!hasScore && availableDice.length > 0) {
          // Bust! End turn with no points - clear all combinations
          const bustPlayers = [...prev.players];
          bustPlayers[prev.currentPlayerIndex].turnScore = 0;
          bustPlayers[prev.currentPlayerIndex].turnCombinations = [];

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
          players: newPlayers,
          currentLockGroup: prev.currentLockGroup + 1
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
      
      // CRITICAL FIX: Score any remaining held dice before ending turn
      const heldDice = prev.dice.filter(d => d.isHeld);
      if (heldDice.length > 0) {
        const { combinations } = calculateScore(heldDice);
        const combinationsWithGroup = combinations.map(combo => ({
          ...combo,
          lockGroup: prev.currentLockGroup
        }));
        
        // Add these final combinations to the turn score
        currentPlayer.turnCombinations = [...currentPlayer.turnCombinations, ...combinationsWithGroup];
        currentPlayer.turnScore = currentPlayer.turnCombinations.reduce((total, combo) => total + combo.points, 0);
      }
      
      // FIXED: Only add ONE entry to score history per complete turn
      // A turn includes ALL rolls from start until "End Turn" is clicked
      if (currentPlayer.turnCombinations.length > 0 && currentPlayer.turnScore > 0) {
        const turnNumber = currentPlayer.scoreHistory.length + 1;
        currentPlayer.scoreHistory.push({
          turnNumber,
          score: currentPlayer.turnScore,
          combinations: [...currentPlayer.turnCombinations], // All combinations from this entire turn
          totalScoreAfter: currentPlayer.totalScore + currentPlayer.turnScore
        });
        
        // Add turn score to total score
        currentPlayer.totalScore += currentPlayer.turnScore;
      }
      
      // Reset turn data for next player
      currentPlayer.turnScore = 0;
      currentPlayer.turnCombinations = []; // Clear turn combinations

      // Check for winner
      const winner = currentPlayer.totalScore >= prev.targetScore ? currentPlayer : null;

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
        hasRolledThisTurn: false,
        currentLockGroup: 0 // Reset lock group for next player's turn
      };
    });
  }, []);

  const calculateTurnScore = useCallback(() => {
    // Turn score is now calculated when dice are locked, not here
    // This function is kept for compatibility but doesn't need to do anything
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