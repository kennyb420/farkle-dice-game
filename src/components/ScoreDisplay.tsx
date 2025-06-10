import React from 'react';
import { Die, Player } from '../types/game';
import { calculateScore } from '../utils/scoring';

interface ScoreDisplayProps {
  heldDice: Die[];
  turnScore: number;
  currentPlayer: Player;
}

export function ScoreDisplay({ heldDice, turnScore, currentPlayer }: ScoreDisplayProps) {
  // Calculate potential score from currently held dice (📌)
  const currentlyHeldDice = heldDice.filter(d => d.isHeld);
  const { combinations: heldCombinations } = calculateScore(currentlyHeldDice);
  const potentialScore = heldCombinations.reduce((sum, combo) => sum + combo.points, 0);

  return (
    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-stone-800">
          Turn Score: {currentPlayer.turnScore}
          {potentialScore > 0 && (
            <span className="text-amber-600 ml-2">
              + {potentialScore} (pending)
            </span>
          )}
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Locked dice points are added immediately. Pending points added when you "End Turn".
        </p>
      </div>
      
      {/* Show currently held dice combinations */}
      {heldCombinations.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-amber-600 mb-2">
            📌 Selected This Roll (Pending):
          </h4>
          {heldCombinations.map((combo, index) => (
            <div key={index} className="flex justify-between items-center text-sm bg-amber-50 rounded p-2 border border-amber-200">
              <span className="text-stone-700">{combo.description}</span>
              <span className="font-medium text-amber-600">+{combo.points}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Total potential score */}
      {potentialScore > 0 && (
        <div className="pt-3 border-t border-stone-200">
          <div className="flex justify-between items-center font-semibold">
            <span className="text-stone-700">Total When Turn Ends:</span>
            <span className="text-blue-600 text-lg">{currentPlayer.turnScore + potentialScore}</span>
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-stone-200">
        <div className="text-xs text-stone-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-amber-100 border border-amber-500 rounded flex items-center justify-center">
              <span className="text-xs">📌</span>
            </div>
            <span>Selected (pending points)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-500 rounded flex items-center justify-center">
              <span className="text-xs">🔒</span>
            </div>
            <span>Locked (points already added)</span>
          </div>
        </div>
      </div>
    </div>
  );
}