import React from 'react';
import { Die, Player } from '../types/game';
import { calculateScore } from '../utils/scoring';

interface ScoreDisplayProps {
  heldDice: Die[];
  turnScore: number;
  currentPlayer: Player;
}

export function ScoreDisplay({ heldDice, turnScore, currentPlayer }: ScoreDisplayProps) {
  // Calculate potential score from ALL scoring dice (locked + held)
  const allScoringDice = heldDice.filter(d => d.isLocked || d.isHeld);
  const { combinations } = calculateScore(allScoringDice);
  const totalPendingScore = combinations.reduce((sum, combo) => sum + combo.points, 0);

  return (
    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-stone-800">
          Turn Score: {currentPlayer.turnScore}
          {totalPendingScore > 0 && currentPlayer.turnScore === 0 && (
            <span className="text-blue-600 ml-2">
              (Will be {totalPendingScore} when turn ends)
            </span>
          )}
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Points are only added to your score when you click "End Turn"
        </p>
      </div>
      
      {/* Show all scoring combinations */}
      {combinations.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-blue-600 mb-2">
            Scoring Combinations This Turn:
          </h4>
          {combinations.map((combo, index) => (
            <div key={index} className="flex justify-between items-center text-sm bg-blue-50 rounded p-2 border border-blue-200">
              <span className="text-stone-700">{combo.description}</span>
              <span className="font-medium text-blue-600">+{combo.points}</span>
            </div>
          ))}
          
          <div className="pt-2 border-t border-blue-200">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-stone-700">Total Pending:</span>
              <span className="text-blue-600 text-lg">+{totalPendingScore}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-stone-200">
        <div className="text-xs text-stone-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-amber-100 border border-amber-500 rounded flex items-center justify-center">
              <span className="text-xs">📌</span>
            </div>
            <span>Selected (can be unselected)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-500 rounded flex items-center justify-center">
              <span className="text-xs">🔒</span>
            </div>
            <span>Locked (cannot be unselected)</span>
          </div>
        </div>
      </div>
    </div>
  );
}