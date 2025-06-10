import React from 'react';
import { Dice3, Hand, RotateCcw, Sparkles } from 'lucide-react';
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
  hasHeldDice
}: GameControlsProps) {
  const availableDice = dice.filter(d => !d.isHeld);
  const hasBusted = !hasAnyScore(availableDice) && availableDice.length > 0 && !canRoll;

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
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={onRoll}
        disabled={!canRoll || isRolling}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Dice3 className="w-5 h-5" />
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>

      <button
        onClick={onAutoSelect}
        disabled={availableDice.length === 0}
        className="flex items-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Sparkles className="w-5 h-5" />
        Auto Select
      </button>

      <button
        onClick={onEndTurn}
        disabled={!hasHeldDice}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Hand className="w-5 h-5" />
        End Turn
      </button>
    </div>
  );
}