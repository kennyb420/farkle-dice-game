import { useState, useCallback, useEffect } from 'react';
import { GameState, Die, Player, GameSettings, GameMode } from '../types/game';
import { calculateScore, hasAnyScore, getAutoSelectableDice } from '../utils/scoring';
import { validateGameState, safeParseInt } from '../utils/validation';
import { AIPlayer } from '../utils/aiLogic';

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
      isAITurn: false,
      aiThinking: false
    };
  });

  const [aiPlayer, setAiPlayer] = useState<AIPlayer | null>(null);

  // Validate game state on changes
  useEffect(() => {
    if (gameMode === 'playing' && gameState.players.length > 0) {
      const validation = validateGameState(gameState);
      if (!validation.isValid) {
        console.error('Game state validation failed:', validation.errors);
        // Could trigger error boundary or reset game state here
      }
    }
  }, [gameState, gameMode]);

  const startGame = useCallback((settings: GameSettings) => {
    try {
      const players: Player[] = [];
      
      // Validate and sanitize settings
      const playerCount = safeParseInt(settings.playerCount, 2);
      const targetScore = safeParseInt(settings.targetScore, 10000);
      
      if (settings.gameMode === 'pve') {
        // Player vs AI
        players.push({
          id: 1,
          name: 'Player',
          totalScore: 0,
          turnScore: 0,
          isAI: false
        });
        
        players.push({
          id: 2,
          name: `AI (${settings.aiDifficulty === 'easy' ? 'Easy' : 'Hard'})`,
          totalScore: 0,
          turnScore: 0,
          isAI: true,
          aiDifficulty: settings.aiDifficulty
        });

        // Create AI player instance
        setAiPlayer(new AIPlayer(players[1], settings.aiDifficulty!));
      } else {
        // Player vs Player
        for (let i = 0; i < Math.min(Math.max(playerCount, 2), 5); i++) {
          players.push({
            id: i + 1,
            name: `Player ${i + 1}`,
            totalScore: 0,
            turnScore: 0,
            isAI: false
          });
        }
        setAiPlayer(null);
      }

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
        targetScore: Math.min(Math.max(targetScore, 1000), 100000),
        hasRolledThisTurn: false,
        isAITurn: players[0].isAI || false,
        aiThinking: false
      });

      setGameMode('playing');
    } catch (error) {
      console.error('Error starting game:', error);
      // Could show error message to user
    }
  }, []);

  // AI Turn Logic
  useEffect(() => {
    if (!gameState.isAITurn || !aiPlayer || gameState.gameWinner || gameState.isRolling) {
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isAI) {
      return;
    }

    const opponentScore = Math.max(...gameState.players.filter(p => !p.isAI).map(p => p.totalScore));
    
    const makeAIMove = () => {
      try {
        const decision = aiPlayer.makeDecision(
          gameState.dice,
          gameState.hasRolledThisTurn,
          gameState.targetScore,
          opponentScore
        );

        setGameState(prev => ({ ...prev, aiThinking: true }));

        setTimeout(() => {
          setGameState(prev => ({ ...prev, aiThinking: false }));
          
          switch (decision.action) {
            case 'roll':
              rollDice();
              break;
            case 'endTurn':
              endTurn();
              break;
            case 'selectDice':
              if (decision.diceToSelect) {
                // Select the dice the AI wants
                setGameState(prev => ({
                  ...prev,
                  dice: prev.dice.map(die => ({
                    ...die,
                    isHeld: die.isHeld || decision.diceToSelect!.includes(die.id)
                  })),
                  canRoll: true
                }));
              }
              break;
          }
        }, aiPlayer.getActionDelay());
      } catch (error) {
        console.error('AI decision error:', error);
        // Fallback to ending turn
        endTurn();
      }
    };

    // Small delay before AI starts thinking
    const thinkingDelay = setTimeout(makeAIMove, 500);
    
    return () => clearTimeout(thinkingDelay);
  }, [gameState.isAITurn, gameState.hasRolledThisTurn, gameState.dice, gameState.canRoll, aiPlayer]);

  const returnToMenu = useCallback(() => {
    setGameMode('menu');
    setAiPlayer(null);
  }, []);

  const rollDice = useCallback(() => {
    if (!gameState.canRoll || gameState.isRolling) return;

    try {
      setGameState(prev => ({ ...prev, isRolling: true }));

      setTimeout(() => {
        setGameState(prev => {
          // Step 1: Lock held dice and roll the rest - DO NOT add score yet
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
          
          const availableDice = newDice.filter(d => !d.isLocked);

          // Step 2: Check if all dice are locked - BONUS TURN!
          if (availableDice.length === 0) {
            const newPlayers = [...prev.players];
            const currentPlayer = newPlayers[prev.currentPlayerIndex];
            
            // CRITICAL: Add the current turn score to total score BEFORE giving bonus turn
            currentPlayer.totalScore += currentPlayer.turnScore;
            
            // Check for winner after adding the score
            const winner = currentPlayer.totalScore >= prev.targetScore ? currentPlayer : null;
            
            // Reset turn score for the bonus turn (they start fresh)
            currentPlayer.turnScore = 0;

            const freshDice: Die[] = Array.from({ length: 6 }, (_, i) => ({
              id: i,
              value: Math.floor(Math.random() * 6) + 1,
              isHeld: false,
              isScoring: false,
              isLocked: false
            }));

            return {
              ...prev,
              players: newPlayers,
              dice: freshDice,
              isRolling: false,
              canRoll: false, // Player must select dice before rolling again
              hasRolledThisTurn: true,
              gameWinner: winner // Set winner if they reached target score
            };
          }

          // Step 3: Check for bust
          const hasScore = hasAnyScore(availableDice);
          if (!hasScore && availableDice.length > 0) {
            // Bust! Reset turn score to 0
            const newPlayers = [...prev.players];
            newPlayers[prev.currentPlayerIndex].turnScore = 0;
            
            return {
              ...prev,
              players: newPlayers,
              dice: newDice,
              isRolling: false,
              canRoll: false,
              hasRolledThisTurn: true
            };
          }

          return {
            ...prev,
            dice: newDice,
            isRolling: false,
            canRoll: false,
            hasRolledThisTurn: true
          };
        });
      }, 600);
    } catch (error) {
      console.error('Error rolling dice:', error);
      setGameState(prev => ({ ...prev, isRolling: false }));
    }
  }, [gameState.canRoll, gameState.isRolling]);

  const toggleDie = useCallback((dieId: number) => {
    // Don't allow manual dice selection during AI turn
    if (gameState.isAITurn) return;
    
    try {
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
    } catch (error) {
      console.error('Error toggling die:', error);
    }
  }, [gameState.isAITurn]);

  const endTurn = useCallback(() => {
    try {
      setGameState(prev => {
        const newPlayers = [...prev.players];
        const currentPlayer = newPlayers[prev.currentPlayerIndex];
        
        // Add the current turnScore to totalScore
        currentPlayer.totalScore += currentPlayer.turnScore;
        
        // Check for winner AFTER adding the score
        const winner = currentPlayer.totalScore >= prev.targetScore ? currentPlayer : null;
        
        // Reset turnScore to 0 for next player
        currentPlayer.turnScore = 0;

        const newDice: Die[] = Array.from({ length: 6 }, (_, i) => ({
          id: i,
          value: Math.floor(Math.random() * 6) + 1,
          isHeld: false,
          isScoring: false,
          isLocked: false
        }));

        const nextPlayerIndex = winner ? prev.currentPlayerIndex : (prev.currentPlayerIndex + 1) % prev.players.length;
        const nextPlayer = newPlayers[nextPlayerIndex];

        return {
          ...prev,
          players: newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          dice: newDice,
          canRoll: true,
          gameWinner: winner,
          hasRolledThisTurn: false,
          isAITurn: !winner && nextPlayer.isAI,
          aiThinking: false
        };
      });
    } catch (error) {
      console.error('Error ending turn:', error);
    }
  }, []);

  const calculateTurnScore = useCallback(() => {
    try {
      setGameState(prev => {
        const newPlayers = [...prev.players];
        const currentPlayer = newPlayers[prev.currentPlayerIndex];
        
        // Calculate score from all scoring dice (locked + held)
        const allScoringDice = prev.dice.filter(d => d.isLocked || d.isHeld);
        const { totalScore } = calculateScore(allScoringDice);
        
        // Update turn score (this is just for display, not added to total yet)
        currentPlayer.turnScore = totalScore;
        
        return {
          ...prev,
          players: newPlayers
        };
      });
    } catch (error) {
      console.error('Error calculating turn score:', error);
    }
  }, []);

  const autoSelectScoring = useCallback(() => {
    if (!gameState.hasRolledThisTurn || gameState.isAITurn) return;
    
    try {
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
    } catch (error) {
      console.error('Error auto-selecting dice:', error);
    }
  }, [gameState.dice, gameState.hasRolledThisTurn, gameState.isAITurn]);

  const startNewGame = useCallback(() => {
    setGameMode('menu');
    setAiPlayer(null);
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