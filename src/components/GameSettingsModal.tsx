import React, { useState } from 'react';
import { X, Users, Target, Play } from 'lucide-react';
import { GameSettings } from '../types/game';

interface GameSettingsModalProps {
  onStartGame: (settings: GameSettings) => void;
  onClose: () => void;
}

export function GameSettingsModal({ onStartGame, onClose }: GameSettingsModalProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [targetScore, setTargetScore] = useState(10000);
  const [useDefaults, setUseDefaults] = useState(true);

  const handleStartGame = () => {
    onStartGame({
      playerCount: useDefaults ? 2 : playerCount,
      targetScore: useDefaults ? 10000 : targetScore
    });
  };

  const presetScores = [5000, 10000, 15000, 20000];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Game Settings
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-500 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Default Rules Toggle */}
          <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useDefaults}
                onChange={(e) => setUseDefaults(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-stone-800">Use Default Rules</span>
                <p className="text-sm text-stone-600">2 players, first to 10,000 points wins</p>
              </div>
            </label>
          </div>

          {/* Custom Settings */}
          {!useDefaults && (
            <div className="space-y-6">
              {/* Player Count */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Players
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => setPlayerCount(count)}
                      className={`
                        p-3 rounded-lg border-2 transition-all font-medium
                        ${playerCount === count
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }
                      `}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Score */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  <Target className="w-4 h-4 inline mr-1" />
                  Target Score
                </label>
                
                {/* Preset Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {presetScores.map((score) => (
                    <button
                      key={score}
                      onClick={() => setTargetScore(score)}
                      className={`
                        p-2 rounded-lg border-2 transition-all font-medium text-sm
                        ${targetScore === score
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }
                      `}
                    >
                      {score.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="relative">
                  <input
                    type="number"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Math.max(1000, parseInt(e.target.value) || 1000))}
                    min="1000"
                    max="100000"
                    step="1000"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Custom score..."
                  />
                  <span className="absolute right-3 top-2 text-stone-500 text-sm">pts</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">Minimum: 1,000 points</p>
              </div>
            </div>
          )}

          {/* Game Preview */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">Game Setup</h4>
            <div className="text-sm text-amber-700 space-y-1">
              <div className="flex justify-between">
                <span>Players:</span>
                <span className="font-medium">{useDefaults ? 2 : playerCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Score:</span>
                <span className="font-medium">{(useDefaults ? 10000 : targetScore).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleStartGame}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}