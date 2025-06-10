import React from 'react';
import { Dice3, Hand, RotateCcw, Sparkles, Bot, Brain } from 'lucide-react';
import { hasAnyScore } from '../utils/scoring';
import { Die } from '../types/game';

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

  if (gameWinner) {
    return (
      <div className="flex justify-center">
        <button
          onClick={onNewGame}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <RotateCcw className="w-5 h-5" />
          New Game
        </button>
      </div>
    );
  }

  if (hasBusted) {
    return (
      <div className="text-center">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-1">BUST!</h3>
          <p className="text-red-600">No scoring combinations. Turn ends with 0 points.</p>
        </div>
        {!isAITurn && (
          <button
            onClick={onEndTurn}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            End Turn
          </button>
        )}
      </div>
    );
  }

  // AI Turn Display
  if (isAITurn) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-800">AI Turn</h3>
          </div>
          {aiThinking ? (
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
              <p className="text-purple-700">AI is thinking...</p>
            </div>
          ) : (
            <p className="text-purple-700">AI is making its move</p>
          )}
        </div>
        
        {/* Show current dice state for AI */}
        {permanentlyLockedDice.length > 0 && (
          <div className="text-center text-xs text-red-600">
            {permanentlyLockedDice.length} dice permanently locked (🔒) this turn
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hasRolledThisTurn && (
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">Roll the dice to start your turn!</p>
        </div>
      )}
      
      {hasRolledThisTurn && !canRoll && !hasBusted && !allDiceLocked && (
        <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 font-medium">
            Select scoring dice (📌) to hold them! Click selected dice to unselect.
          </p>
        </div>
      )}
      
      {allDiceLocked && (
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-800">BONUS TURN!</h3>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-purple-700 font-medium">
            All 6 dice locked! You get fresh dice and continue your turn!
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onRoll}
          disabled={!canRoll || isRolling}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Dice3 className="w-5 h-5" />
          {isRolling ? 'Rolling...' : hasRolledThisTurn ? 'Roll Remaining Dice' : 'Roll Dice'}
        </button>

        <button
          onClick={onEndTurn}
          disabled={!hasAnyLockedOrHeldDice}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Hand className="w-5 h-5" />
          End Turn
        </button>
      </div>
      
      {heldDice.length > 0 && (
        <div className="text-center text-xs text-amber-600">
          {heldDice.length} dice selected (📌) - click "Roll Remaining Dice" to lock them permanently or "End Turn" to score them
        </div>
      )}
      
      {permanentlyLockedDice.length > 0 && (
        <div className="text-center text-xs text-red-600">
          {permanentlyLockedDice.length} dice permanently locked (🔒) this turn
        </div>
      )}
    </div>
  );
}