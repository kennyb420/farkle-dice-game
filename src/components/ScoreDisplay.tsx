import React from 'react';
import { Die, Player } from '../types/game';

interface ScoreDisplayProps {
  heldDice: Die[];
  turnScore: number;
  currentPlayer: Player;
}

export function ScoreDisplay({ heldDice, turnScore, currentPlayer }: ScoreDisplayProps) {
  return (
    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
      <h3 className="text-lg font-semibold text-stone-800 mb-3">Turn Score: {turnScore}</h3>
      
      {currentPlayer.turnCombinations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-stone-600 mb-2">Scoring Combinations This Turn:</h4>
          
          {/* Group combinations by lock group */}
          {Array.from(new Set(currentPlayer.turnCombinations.map(c => c.lockGroup))).map(lockGroup => {
            const groupCombinations = currentPlayer.turnCombinations.filter(c => c.lockGroup === lockGroup);
            const groupTotal = groupCombinations.reduce((sum, combo) => sum + combo.points, 0);
            
            return (
              <div key={lockGroup} className="bg-white rounded p-3 border border-stone-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-stone-500">
                    Roll #{lockGroup + 1}
                  </span>
                  <span className="text-sm font-medium text-green-600">+{groupTotal}</span>
                </div>
                
                <div className="space-y-1">
                  {groupCombinations.map((combo, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-stone-700">{combo.description}</span>
                      <span className="font-medium text-green-600">+{combo.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          <div className="pt-2 border-t border-stone-300">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-stone-700">Total Turn Score:</span>
              <span className="text-green-600">+{turnScore}</span>
            </div>
          </div>
        </div>
      )}
      
      {currentPlayer.turnCombinations.length === 0 && heldDice.length > 0 && (
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