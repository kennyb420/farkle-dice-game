import React from 'react';
import { Die, Player } from '../types/game';
import { calculateScore } from '../utils/scoring';

interface ScoreDisplayProps {
  heldDice: Die[];
  turnScore: number;
  currentPlayer: Player;
}

export function ScoreDisplay({ heldDice, turnScore, currentPlayer }: ScoreDisplayProps) {
  // Separate locked and held dice
  const lockedDice = heldDice.filter(d => d.isLocked);
  const pinnedDice = heldDice.filter(d => d.isHeld && !d.isLocked);
  
  // Calculate scores separately
  const lockedScore = lockedDice.length > 0 ? calculateScore(lockedDice) : { combinations: [], totalScore: 0 };
  const pinnedScore = pinnedDice.length > 0 ? calculateScore(pinnedDice) : { combinations: [], totalScore: 0 };
  
  const totalTurnScore = lockedScore.totalScore + pinnedScore.totalScore;

  return (
    <div className="bg-amber-900 bg-opacity-30 rounded-lg p-4 border border-amber-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-amber-100 drop-shadow">
          Turn Score: {totalTurnScore}
        </h3>
        <p className="text-xs text-amber-300 mt-1">
          Combined score from locked and pinned dice
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Locked Dice Score */}
        {lockedDice.length > 0 && (
          <div className="bg-red-900 bg-opacity-40 rounded-lg p-3 border border-red-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-red-600 border border-red-500 rounded flex items-center justify-center">
                <span className="text-xs">🔒</span>
              </div>
              <h4 className="text-sm font-semibold text-red-200">
                Locked Dice Score: {lockedScore.totalScore}
              </h4>
            </div>
            
            {lockedScore.combinations.map((combo, index) => (
              <div key={index} className="flex justify-between items-center text-sm mb-1">
                <span className="text-red-300">{combo.description}</span>
                <span className="font-medium text-red-200">+{combo.points}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pinned Dice Score */}
        {pinnedDice.length > 0 && (
          <div className="bg-amber-900 bg-opacity-40 rounded-lg p-3 border border-amber-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-amber-600 border border-amber-500 rounded flex items-center justify-center">
                <span className="text-xs">📌</span>
              </div>
              <h4 className="text-sm font-semibold text-amber-200">
                Pinned Dice Score: {pinnedScore.totalScore}
              </h4>
            </div>
            
            {pinnedScore.combinations.map((combo, index) => (
              <div key={index} className="flex justify-between items-center text-sm mb-1">
                <span className="text-amber-300">{combo.description}</span>
                <span className="font-medium text-amber-200">+{combo.points}</span>
              </div>
            ))}
            
            <p className="text-xs text-amber-400 mt-2 italic">
              Click "Roll Remaining Dice" to lock these or "End Turn" to score them
            </p>
          </div>
        )}

        {/* Total Summary */}
        {(lockedDice.length > 0 || pinnedDice.length > 0) && (
          <div className="pt-3 border-t border-amber-700">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-amber-200">Total Turn Score:</span>
              <span className="text-green-400 text-lg">+{totalTurnScore}</span>
            </div>
            
            {lockedDice.length > 0 && pinnedDice.length > 0 && (
              <div className="text-xs text-amber-400 mt-1">
                🔒 Locked: {lockedScore.totalScore} + 📌 Pinned: {pinnedScore.totalScore} = {totalTurnScore}
              </div>
            )}
          </div>
        )}

        {/* No scoring dice message */}
        {lockedDice.length === 0 && pinnedDice.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-amber-300">No scoring dice selected</p>
            <p className="text-xs text-amber-400 mt-1">Select dice after rolling to score points</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-amber-700">
        <div className="text-xs text-amber-400 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-600 border border-amber-500 rounded flex items-center justify-center">
              <span className="text-xs">📌</span>
            </div>
            <span>Pinned - can be unlocked before rolling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 border border-red-500 rounded flex items-center justify-center">
              <span className="text-xs">🔒</span>
            </div>
            <span>Locked - permanently scored this turn</span>
          </div>
        </div>
      </div>
    </div>
  );
}