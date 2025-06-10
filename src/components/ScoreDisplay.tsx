import React from 'react';
import { Die, Player } from '../types/game';
import { calculateScore } from '../utils/scoring';

interface ScoreDisplayProps {
  heldDice: Die[];
  turnScore: number;
  currentPlayer: Player;
}

export function ScoreDisplay({ heldDice, turnScore, currentPlayer }: ScoreDisplayProps) {
  // Calculate score ONLY for currently held dice (not locked ones)
  const currentlyHeldDice = heldDice.filter(d => d.isHeld);
  const { combinations } = calculateScore(currentlyHeldDice);
  const potentialScore = combinations.reduce((sum, combo) => sum + combo.points, 0);

  return (
    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-stone-800">
          Turn Score: {turnScore}
          {potentialScore > 0 && (
            <span className="text-green-600 ml-2">
              + {potentialScore} (pending)
            </span>
          )}
        </h3>
      </div>
      
      {combinations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-stone-600 mb-2">
            Current Selection (this roll):
          </h4>
          {combinations.map((combo, index) => (
            <div key={index} className="flex justify-between items-center text-sm bg-white rounded p-2 border border-stone-200">
              <span className="text-stone-700">{combo.description}</span>
              <span className="font-medium text-green-600">+{combo.points}</span>
            </div>
          ))}
          <div className="text-xs text-amber-600 bg-amber-50 rounded p-2 border border-amber-200">
            💡 These points will be added when you roll or end your turn
          </div>
        </div>
      )}
      
      {combinations.length === 0 && currentlyHeldDice.length > 0 && (
        <p className="text-sm text-stone-500">Selected dice have no scoring combinations</p>
      )}
      
      {turnScore > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-200">
          <div className="text-sm text-stone-600">
            <span className="font-medium">Locked Score This Turn: </span>
            <span className="text-green-600 font-semibold">{turnScore}</span>
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-stone-200">
        <div className="text-xs text-stone-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-amber-100 border border-amber-500 rounded flex items-center justify-center">
              <span className="text-xs">📌</span>
            </div>
            <span>Selected (can unlock before rolling)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-500 rounded flex items-center justify-center">
              <span className="text-xs">🔒</span>
            </div>
            <span>Permanently locked (scored)</span>
          </div>
        </div>
      </div>
    </div>
  );
}