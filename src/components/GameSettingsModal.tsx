import React, { useState } from 'react';
import { X, Users, Target, Play, Bot, Zap, Brain, AlertTriangle } from 'lucide-react';
import { GameSettings } from '../types/game';
import { validateGameSettings, validateNumericInput, safeParseInt } from '../utils/validation';

interface GameSettingsModalProps {
  gameMode: 'pvp' | 'pve';
  onStartGame: (settings: GameSettings) => void;
  onClose: () => void;
}

export function GameSettingsModal({ gameMode, onStartGame, onClose }: GameSettingsModalProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [targetScore, setTargetScore] = useState(10000);
  const [targetScoreInput, setTargetScoreInput] = useState('10000');
  const [useDefaults, setUseDefaults] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'hard'>('easy');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const validateAndStartGame = () => {
    const settings: GameSettings = {
      playerCount: gameMode === 'pve' ? 2 : (useDefaults ? 2 : playerCount),
      targetScore: useDefaults ? 10000 : targetScore,
      gameMode,
      aiDifficulty: gameMode === 'pve' ? aiDifficulty : undefined
    };

    const validation = validateGameSettings(settings);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);
      
      // Announce errors to screen readers
      const errorMessage = `Validation failed: ${validation.errors.join(', ')}`;
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = errorMessage;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
      
      return;
    }

    setValidationErrors([]);
    setValidationWarnings([]);
    onStartGame(settings);
  };

  const handleTargetScoreChange = (value: string) => {
    setTargetScoreInput(value);
    
    const validation = validateNumericInput(value, 1000, 100000, 'Target score');
    if (validation.isValid) {
      setTargetScore(safeParseInt(value, 10000));
      setValidationErrors([]);
    } else {
      setValidationErrors(validation.errors);
    }
  };

  const handlePlayerCountChange = (count: number) => {
    if (count >= 2 && count <= 5) {
      setPlayerCount(count);
      setValidationErrors([]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      validateAndStartGame();
    }
  };

  const presetScores = [5000, 10000, 15000, 20000];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onKeyDown={handleKeyDown}
    >
      <div className="wooden-panel rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto tavern-glow">
        {/* Header */}
        <div className={`text-amber-100 p-6 rounded-t-xl ${
          gameMode === 'pve' 
            ? 'bg-gradient-to-r from-purple-800 to-purple-900 border-b-2 border-purple-700' 
            : 'bg-gradient-to-r from-blue-800 to-blue-900 border-b-2 border-blue-700'
        }`}>
          <div className="flex items-center justify-between">
            <h2 
              id="settings-title"
              className="text-xl font-semibold flex items-center gap-2 drop-shadow"
            >
              {gameMode === 'pve' ? <Bot className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              {gameMode === 'pve' ? 'Player vs AI' : 'Player vs Player'}
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full transition-colors ${
                gameMode === 'pve' ? 'hover:bg-purple-700' : 'hover:bg-blue-700'
              }`}
              aria-label="Close settings dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-wood-medium wood-grain">
          {/* Validation Messages */}
          {(validationErrors.length > 0 || validationWarnings.length > 0) && (
            <div 
              className="space-y-2"
              role="alert"
              aria-live="polite"
            >
              {validationErrors.map((error, index) => (
                <div key={`error-${index}`} className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </div>
                </div>
              ))}
              
              {validationWarnings.map((warning, index) => (
                <div key={`warning-${index}`} className="bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-yellow-200 text-sm">{warning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Difficulty Selection (only for PvE) */}
          {gameMode === 'pve' && (
            <fieldset className="bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700">
              <legend className="text-sm font-medium text-purple-200 mb-3 flex items-center gap-1">
                <Brain className="w-4 h-4" />
                AI Difficulty
              </legend>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="ai-difficulty-label">
                <button
                  onClick={() => setAiDifficulty('easy')}
                  className={`
                    p-4 rounded-lg border-2 transition-all font-medium text-left
                    ${aiDifficulty === 'easy'
                      ? 'border-green-500 bg-green-900 bg-opacity-50 text-green-200'
                      : 'border-amber-700 bg-amber-900 bg-opacity-30 text-amber-300 hover:border-amber-600'
                    }
                  `}
                  role="radio"
                  aria-checked={aiDifficulty === 'easy'}
                  aria-label="Easy AI difficulty"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="font-semibold">Easy</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>• Makes mistakes</div>
                    <div>• Conservative play</div>
                    <div>• Beginner friendly</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setAiDifficulty('hard')}
                  className={`
                    p-4 rounded-lg border-2 transition-all font-medium text-left
                    ${aiDifficulty === 'hard'
                      ? 'border-red-500 bg-red-900 bg-opacity-50 text-red-200'
                      : 'border-amber-700 bg-amber-900 bg-opacity-30 text-amber-300 hover:border-amber-600'
                    }
                  `}
                  role="radio"
                  aria-checked={aiDifficulty === 'hard'}
                  aria-label="Hard AI difficulty"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-red-400" />
                    <span className="font-semibold">Hard</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>• Optimal play</div>
                    <div>• Aggressive style</div>
                    <div>• Very challenging</div>
                  </div>
                </button>
              </div>
            </fieldset>
          )}

          {/* Default Rules Toggle */}
          <div className="bg-amber-900 bg-opacity-30 rounded-lg p-4 border border-amber-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useDefaults}
                onChange={(e) => setUseDefaults(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                aria-describedby="default-rules-description"
              />
              <div>
                <span className="font-medium text-amber-200">Use Default Rules</span>
                <p id="default-rules-description" className="text-sm text-amber-300">
                  {gameMode === 'pve' ? 'Player vs AI' : '2 players'}, first to 10,000 points wins
                </p>
              </div>
            </label>
          </div>

          {/* Custom Settings (only for PvP and when not using defaults) */}
          {gameMode === 'pvp' && !useDefaults && (
            <fieldset className="space-y-6">
              <legend className="sr-only">Custom Game Settings</legend>
              
              {/* Player Count */}
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-3">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Players
                </label>
                <div 
                  className="grid grid-cols-4 gap-2"
                  role="radiogroup"
                  aria-label="Select number of players"
                >
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => handlePlayerCountChange(count)}
                      className={`
                        p-3 rounded-lg border-2 transition-all font-medium
                        ${playerCount === count
                          ? 'border-blue-500 bg-blue-900 bg-opacity-50 text-blue-200'
                          : 'border-amber-700 bg-amber-900 bg-opacity-30 text-amber-300 hover:border-amber-600'
                        }
                      `}
                      role="radio"
                      aria-checked={playerCount === count}
                      aria-label={`${count} players`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>
          )}

          {/* Target Score (when not using defaults) */}
          {!useDefaults && (
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-3">
                <Target className="w-4 h-4 inline mr-1" />
                Target Score
              </label>
              
              {/* Preset Buttons */}
              <div 
                className="grid grid-cols-2 gap-2 mb-3"
                role="radiogroup"
                aria-label="Select target score preset"
              >
                {presetScores.map((score) => (
                  <button
                    key={score}
                    onClick={() => {
                      setTargetScore(score);
                      setTargetScoreInput(score.toString());
                      setValidationErrors([]);
                    }}
                    className={`
                      p-2 rounded-lg border-2 transition-all font-medium text-sm
                      ${targetScore === score
                        ? 'border-blue-500 bg-blue-900 bg-opacity-50 text-blue-200'
                        : 'border-amber-700 bg-amber-900 bg-opacity-30 text-amber-300 hover:border-amber-600'
                      }
                    `}
                    role="radio"
                    aria-checked={targetScore === score}
                    aria-label={`Target score ${score.toLocaleString()} points`}
                  >
                    {score.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative">
                <label htmlFor="custom-target-score" className="sr-only">
                  Custom target score
                </label>
                <input
                  id="custom-target-score"
                  type="number"
                  value={targetScoreInput}
                  onChange={(e) => handleTargetScoreChange(e.target.value)}
                  min="1000"
                  max="100000"
                  step="1000"
                  className={`
                    w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                    bg-amber-900 bg-opacity-30 text-amber-100
                    ${validationErrors.length > 0 ? 'border-red-500' : 'border-amber-700'}
                  `}
                  placeholder="Custom score..."
                  aria-describedby="target-score-help target-score-error"
                  aria-invalid={validationErrors.length > 0}
                />
                <span className="absolute right-3 top-2 text-amber-400 text-sm" aria-hidden="true">pts</span>
              </div>
              <p id="target-score-help" className="text-xs text-amber-400 mt-1">
                Minimum: 1,000 points, Maximum: 100,000 points
              </p>
            </div>
          )}

          {/* Game Preview */}
          <div className={`rounded-lg p-4 border ${
            gameMode === 'pve' 
              ? 'bg-purple-900 bg-opacity-30 border-purple-700' 
              : 'bg-blue-900 bg-opacity-30 border-blue-700'
          }`}>
            <h4 className={`font-medium mb-2 ${
              gameMode === 'pve' ? 'text-purple-200' : 'text-blue-200'
            }`}>
              Game Setup Summary
            </h4>
            <div className={`text-sm space-y-1 ${
              gameMode === 'pve' ? 'text-purple-300' : 'text-blue-300'
            }`}>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-medium">
                  {gameMode === 'pve' ? `Player vs AI (${aiDifficulty})` : 'Player vs Player'}
                </span>
              </div>
              {gameMode === 'pvp' && (
                <div className="flex justify-between">
                  <span>Players:</span>
                  <span className="font-medium">{useDefaults ? 2 : playerCount}</span>
                </div>
              )}
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
              className="flex-1 px-4 py-3 border border-amber-700 text-amber-200 rounded-lg hover:bg-amber-900 hover:bg-opacity-30 transition-colors font-medium"
              aria-label="Cancel and return to main menu"
            >
              Cancel
            </button>
            <button
              onClick={validateAndStartGame}
              disabled={validationErrors.length > 0}
              className={`
                flex-1 px-4 py-3 text-amber-100 rounded-lg transition-all font-medium 
                flex items-center justify-center gap-2
                ${validationErrors.length > 0 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : gameMode === 'pve'
                    ? 'bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 border border-purple-600'
                    : 'bg-gradient-to-r from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 border border-green-600'
                }
              `}
              aria-label={`Start ${gameMode === 'pve' ? 'Player vs AI' : 'Player vs Player'} game`}
              aria-describedby={validationErrors.length > 0 ? 'validation-errors' : undefined}
            >
              <Play className="w-4 h-4" />
              Start Game
            </button>
          </div>

          {/* Keyboard shortcuts help */}
          <div className="text-xs text-amber-400 text-center pt-2 border-t border-amber-700">
            <p>Press <kbd className="bg-amber-900 px-1 rounded">Esc</kbd> to close • <kbd className="bg-amber-900 px-1 rounded">Ctrl+Enter</kbd> to start game</p>
          </div>
        </div>
      </div>
    </div>
  );
}