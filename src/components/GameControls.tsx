import React from 'react';
import { Dice3, Hand, RotateCcw } from 'lucide-react';
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
  hasRolledThisTurn
}: GameControlsProps) {
  const availableDice = dice.filter(d => !d.isLocked);
  const permanentlyLockedDice = dice.filter(d => d.isLocked);
  const heldDice = dice.filter(d => d.isHeld);
  const hasBusted = !hasAnyScore(availableDice) && availableDice.length > 0 && !canRoll && hasRolledThisTurn;
  const hasAnyLockedDice = dice.some(d => d.isLocked);

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
        <button
          onClick={onEndTurn}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          End Turn
        </button>
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
      
      {hasRolledThisTurn && !canRoll && !hasBusted && (
        <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 font-medium">
            Select scoring dice (📌) to hold them! Click selected dice to unselect.
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
          disabled={!hasAnyLockedDice}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Hand className="w-5 h-5" />
          End Turn
        </button>
      </div>
      
      {heldDice.length > 0 && (
        <div className="text-center text-xs text-amber-600">
          {heldDice.length} dice selected (📌) - click "Roll Remaining Dice" to lock them permanently
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