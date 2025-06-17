import React from 'react';
import { Dice3, Hand, RotateCcw, Sparkles, Bot, Brain } from 'lucide-react';
import { hasAnyScore } from '../utils/scoring';
import { Die } from '../types/game';
import { ComponentErrorBoundary } from './ErrorBoundary';

interface GameControlsProps {
  onRoll: () => void;
  onEndTurn: () => void;
  onAutoSelect: () => void;
  onNewGame: () => void;
  canRoll: boolean;
  isRolling: boolean;
  dice: Die[];
  gameWinner: any;
  hasHeldDice: boolean;
  hasRolledThisTurn: boolean;
  isAITurn?: boolean;
  aiThinking?: boolean;
}

export function GameControls({ 
  onRoll, 
  onEndTurn, 
  onAutoSelect, 
  onNewGame,
  canRoll, 
  isRolling, 
  dice,
  gameWinner,
  hasHeldDice,
  hasRolledThisTurn,
  isAITurn = false,
  aiThinking = false
}: GameControlsProps) {
  const availableDice = dice.filter(d => !d.isLocked);
  const permanentlyLockedDice = dice.filter(d => d.isLocked);
  const heldDice = dice.filter(d => d.isHeld);
  const hasBusted = !hasAnyScore(availableDice) && availableDice.length > 0 && !canRoll && hasRolledThisTurn;
  const hasAnyLockedOrHeldDice = dice.some(d => d.isLocked || d.isHeld);
  
  // Check if all dice are locked (bonus turn scenario)
  const allDiceLocked = dice.every(d => d.isLocked) && dice.length === 6;

  // Keyboard shortcuts
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isAITurn || gameWinner) return;

    switch (event.key) {
      case 'r':
      case 'R':
        if (canRoll && !isRolling) {
          event.preventDefault();
          onRoll();
        }
        break;
      case 'e':
      case 'E':
        if (hasAnyLockedOrHeldDice && !hasBusted) {
          event.preventDefault();
          onEndTurn();
        }
        break;
      case 'a':
      case 'A':
        if (hasRolledThisTurn && !isAITurn) {
          event.preventDefault();
          onAutoSelect();
        }
        break;
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, [canRoll, isRolling, hasAnyLockedOrHeldDice, hasBusted, hasRolledThisTurn, isAITurn, gameWinner]);

  if (gameWinner) {
    return (
      <ComponentErrorBoundary componentName="Game Winner Controls">
        <div className="flex justify-center">
          <button
            onClick={onNewGame}
            className="flex items-center gap-2 px-6 py-3 tavern-button rounded-lg focus:ring-2 focus:ring-amber-500"
            aria-label="Start a new game"
          >
            <RotateCcw className="w-5 h-5" />
            New Game
          </button>
        </div>
      </ComponentErrorBoundary>
    );
  }

  if (hasBusted) {
    return (
      <ComponentErrorBoundary componentName="Bust Controls">
        <div className="text-center">
          <div 
            className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <h3 className="text-lg font-semibold text-red-200 mb-1 drop-shadow">BUST!</h3>
            <p className="text-red-300">No scoring combinations. Turn ends with 0 points.</p>
          </div>
          {!isAITurn && (
            <button
              onClick={onEndTurn}
              className="px-6 py-3 bg-red-800 text-amber-100 rounded-lg hover:bg-red-700 transition-colors font-medium border border-red-600 focus:ring-2 focus:ring-red-500"
              aria-label="End turn after bust"
              autoFocus
            >
              End Turn
            </button>
          )}
        </div>
      </ComponentErrorBoundary>
    );
  }

  // AI Turn Display
  if (isAITurn) {
    return (
      <ComponentErrorBoundary componentName="AI Turn Controls">
        <div className="text-center space-y-4">
          <div 
            className="p-4 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-200 drop-shadow">AI Turn</h3>
            </div>
            {aiThinking ? (
              <div className="flex items-center justify-center gap-2">
                <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                <p className="text-purple-300">AI is thinking...</p>
              </div>
            ) : (
              <p className="text-purple-300">AI is making its move</p>
            )}
          </div>
          
          {/* Show current dice state for AI */}
          {permanentlyLockedDice.length > 0 && (
            <div className="text-center text-xs text-red-400">
              {permanentlyLockedDice.length} dice permanently locked (🔒) this turn
            </div>
          )}
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Game Controls">
      <div className="space-y-4">
        {/* Status Messages */}
        {!hasRolledThisTurn && (
          <div 
            className="text-center p-3 bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <p className="text-blue-200 font-medium">Roll the dice to start your turn!</p>
          </div>
        )}
        
        {hasRolledThisTurn && !canRoll && !hasBusted && !allDiceLocked && (
          <div 
            className="text-center p-3 bg-amber-900 bg-opacity-50 border border-amber-700 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <p className="text-amber-200 font-medium">
              Select scoring dice (📌) to hold them! Click selected dice to unselect.
            </p>
          </div>
        )}
        
        {allDiceLocked && (
          <div 
            className="text-center p-4 bg-gradient-to-r from-purple-900 to-pink-900 bg-opacity-50 border-2 border-purple-600 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-200 drop-shadow">BONUS TURN!</h3>
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-purple-300 font-medium">
              All 6 dice locked! You get fresh dice and continue your turn!
            </p>
          </div>
        )}
        
        {/* Main Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onRoll}
            disabled={!canRoll || isRolling}
            className="flex items-center gap-2 px-6 py-3 bg-blue-800 text-amber-100 rounded-lg hover:bg-blue-700 disabled:bg-stone-600 disabled:cursor-not-allowed transition-colors font-medium border border-blue-600 hover:border-blue-500 focus:ring-2 focus:ring-blue-500"
            aria-label={isRolling ? 'Rolling dice...' : hasRolledThisTurn ? 'Roll remaining dice' : 'Roll all dice to start turn'}
            aria-describedby="roll-help"
          >
            <Dice3 className="w-5 h-5" />
            {isRolling ? 'Rolling...' : hasRolledThisTurn ? 'Roll Remaining Dice' : 'Roll Dice'}
          </button>

          <button
            onClick={onEndTurn}
            disabled={!hasAnyLockedOrHeldDice}
            className="flex items-center gap-2 px-6 py-3 bg-green-800 text-amber-100 rounded-lg hover:bg-green-700 disabled:bg-stone-600 disabled:cursor-not-allowed transition-colors font-medium border border-green-600 hover:border-green-500 focus:ring-2 focus:ring-green-500"
            aria-label="End turn and add current score to total"
            aria-describedby="end-turn-help"
          >
            <Hand className="w-5 h-5" />
            End Turn
          </button>

          {hasRolledThisTurn && availableDice.length > 0 && (
            <button
              onClick={onAutoSelect}
              className="flex items-center gap-2 px-4 py-3 bg-purple-800 text-amber-100 rounded-lg hover:bg-purple-700 transition-colors font-medium border border-purple-600 hover:border-purple-500 focus:ring-2 focus:ring-purple-500"
              aria-label="Automatically select all scoring dice"
              aria-describedby="auto-select-help"
            >
              <Sparkles className="w-4 h-4" />
              Auto Select
            </button>
          )}
        </div>
        
        {/* Status Information */}
        {heldDice.length > 0 && (
          <div className="text-center text-xs text-amber-400" aria-live="polite">
            {heldDice.length} dice selected (📌) - click "Roll Remaining Dice" to lock them permanently or "End Turn" to score them
          </div>
        )}
        
        {permanentlyLockedDice.length > 0 && (
          <div className="text-center text-xs text-red-400" aria-live="polite">
            {permanentlyLockedDice.length} dice permanently locked (🔒) this turn
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="text-center text-xs text-amber-500 pt-2 border-t border-amber-800">
          <p>
            Keyboard shortcuts: 
            <kbd className="bg-amber-900 px-1 mx-1 rounded">R</kbd>Roll • 
            <kbd className="bg-amber-900 px-1 mx-1 rounded">E</kbd>End Turn • 
            <kbd className="bg-amber-900 px-1 mx-1 rounded">A</kbd>Auto Select
          </p>
        </div>

        {/* Hidden help text for screen readers */}
        <div className="sr-only">
          <div id="roll-help">
            Press R key or click to roll dice. You must select scoring dice before rolling again.
          </div>
          <div id="end-turn-help">
            Press E key or click to end your turn and add your current score to your total.
          </div>
          <div id="auto-select-help">
            Press A key or click to automatically select all dice that can score points.
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}