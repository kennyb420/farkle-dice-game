import React from 'react';
import { Die, Player } from '../types/game';
import { calculateScore } from '../utils/scoring';

interface ScoreDisplayProps {
  heldDice: Die[];
  turnScore: number;
  currentPlayer: Player;
}

export function ScoreDisplay({ heldDice, turnScore, currentPlayer }: ScoreDisplayProps) {
  // Calculate total score from all scoring dice (locked + held)
  const allScoringDice = heldDice.filter(d => d.isLocked || d.isHeld);
  const { combinations, totalScore } = calculateScore(allScoringDice);

  return (
    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-stone-800">
          Turn Score: {totalScore}
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          This shows your total points from all selected dice this turn.
        </p>
      </div>
      
      {/* Show all scoring combinations */}
      {combinations.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-green-600 mb-2">
            Scoring Combinations:
          </h4>
          {combinations.map((combo, index) => (
            <div key={index} className="flex justify-between items-center text-sm bg-green-50 rounded p-2 border border-green-200">
              <span className="text-stone-700">{combo.description}</span>
              <span className="font-medium text-green-600">+{combo.points}</span>
            </div>
          ))}
          
          <div className="pt-2 border-t border-green-200">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-stone-700">Total Turn Score:</span>
              <span className="text-green-600 text-lg">+{totalScore}</span>
            </div>
          </div>
        </div>
      )}
      
      {combinations.length === 0 && allScoringDice.length > 0 && (
        <p className="text-sm text-stone-500">No scoring combinations from selected dice</p>
      )}
      
      <div className="mt-3 pt-3 border-t border-stone-200">
        <div className="text-xs text-stone-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-amber-100 border border-amber-500 rounded flex items-center justify-center">
              <span className="text-xs">📌</span>
            </div>
            <span>Held (can be unlocked before rolling)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-500 rounded flex items-center justify-center">
              <span className="text-xs">🔒</span>
            </div>
            <span>Locked (cannot be changed)</span>
          </div>
        </div>
      </div>
    </div>
  );
}