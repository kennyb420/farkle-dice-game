import { useState, useCallback } from 'react';
import { GameState, Die, Player } from '../types/game';
import { calculateScore, hasAnyScore, getAutoSelectableDice } from '../utils/scoring';

const TARGET_SCORE = 10000;

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialDice: Die[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      isHeld: false,
      isScoring: false,
      isLocked: false
    }));

    return {
      players: [
        { id: 1, name: 'Player 1', totalScore: 0, turnScore: 0 },
        { id: 2, name: 'Player 2', totalScore: 0, turnScore: 0 }
      ],
      currentPlayerIndex: 0,
      dice: initialDice,
      isRolling: false,
      canRoll: true,
      gameWinner: null,
      targetScore: TARGET_SCORE,
      hasRolledThisTurn: false
    };
  });

  const rollDice = useCallback(() => {
    if (!gameState.canRoll || gameState.isRolling) return;

    setGameState(prev => ({ ...prev, isRolling: true }));

    setTimeout(() => {
      setGameState(prev => {
        // Lock all currently held dice permanently
        const newDice = prev.dice.map(die => ({
          ...die,
          value: die.isHeld || die.isLocked ? die.value : Math.floor(Math.random() * 6) + 1,
          isScoring: false,
          isLocked: die.isHeld || die.isLocked, // Lock held dice
          isHeld: die.isLocked // Keep previously locked dice held
        }));

        const availableDice = newDice.filter(d => !d.isLocked);
        const hasScore = hasAnyScore(availableDice);

        if (!hasScore && availableDice.length > 0) {
          // Bust! End turn with no points
          const newPlayers = [...prev.players];
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
          canRoll: true,
          hasRolledThisTurn: true
        };
      });
    }, 600);
  }, [gameState.canRoll, gameState.isRolling]);

  const toggleDie = useCallback((dieId: number) => {
    setGameState(prev => {
      // Only allow toggling if the die is not locked and player has rolled this turn
      if (!prev.hasRolledThisTurn) return prev;
      
      return {
        ...prev,
        dice: prev.dice.map(die => {
          if (die.id === dieId && !die.isLocked) {
            return { ...die, isHeld: !die.isHeld };
          }
          return die;
        })
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const currentPlayer = newPlayers[prev.currentPlayerIndex];
      currentPlayer.totalScore += currentPlayer.turnScore;
      currentPlayer.turnScore = 0;

      // Check for winner
      const winner = currentPlayer.totalScore >= TARGET_SCORE ? currentPlayer : null;

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
    const heldDice = gameState.dice.filter(d => d.isHeld || d.isLocked);
    const { totalScore } = calculateScore(heldDice);
    
    setGameState(prev => {
      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayerIndex].turnScore = totalScore;
      return { ...prev, players: newPlayers };
    });
  }, [gameState.dice]);

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
      }))
    }));
  }, [gameState.dice, gameState.hasRolledThisTurn]);

  const startNewGame = useCallback(() => {
    const newDice: Die[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      isHeld: false,
      isScoring: false,
      isLocked: false
    }));

    setGameState({
      players: [
        { id: 1, name: 'Player 1', totalScore: 0, turnScore: 0 },
        { id: 2, name: 'Player 2', totalScore: 0, turnScore: 0 }
      ],
      currentPlayerIndex: 0,
      dice: newDice,
      isRolling: false,
      canRoll: true,
      gameWinner: null,
      targetScore: TARGET_SCORE,
      hasRolledThisTurn: false
    });
  }, []);

  return {
    gameState,
    rollDice,
    toggleDie,
    endTurn,
    calculateTurnScore,
    autoSelectScoring,
    startNewGame
  };
}