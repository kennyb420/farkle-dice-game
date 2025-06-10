import React from 'react';
import { Die, Player } from '../types/game';
import { calculateScore } from '../utils/scoring';

interface ScoreDisplayProps {
  heldDice: Die[];
  turnScore: number;
  currentPlayer: Player;
}

export function ScoreDisplay({ heldDice, turnScore, currentPlayer }: ScoreDisplayProps) {
  const { combinations } = calculateScore(heldDice);

  return (
    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
      <h3 className="text-lg font-semibold text-stone-800 mb-3">Turn Score: {turnScore}</h3>
      
      {combinations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-stone-600 mb-2">Scoring Combinations:</h4>
          {combinations.map((combo, index) => (
            <div key={index} className="flex justify-between items-center text-sm bg-white rounded p-2 border border-stone-200">
              <span className="text-stone-700">{combo.description}</span>
              <span className="font-medium text-green-600">+{combo.points}</span>
            </div>
          ))}
        </div>
      )}
      
      {combinations.length === 0 && heldDice.length > 0 && (
        <p className="text-sm text-stone-500">No scoring combinations selected</p>
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
            <span>Permanently locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}