import React, { useState } from 'react';
import { Dice1, Users, Settings, Play, Bot, Zap, Brain } from 'lucide-react';
import { GameSettings } from '../types/game';
import { GameSettingsModal } from './GameSettingsModal';

interface MainMenuProps {
  onStartGame: (settings: GameSettings) => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'pvp' | 'pve' | null>(null);

  const handlePlayerVsPlayer = () => {
    setSelectedMode('pvp');
    setShowSettings(true);
  };

  const handlePlayerVsAI = () => {
    setSelectedMode('pve');
    setShowSettings(true);
  };

  const handleStartWithSettings = (settings: GameSettings) => {
    setShowSettings(false);
    setSelectedMode(null);
    onStartGame(settings);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen bg-wood-table wood-grain candlelight flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Dice1 className="w-12 h-12 text-amber-400 animate-flicker" />
            <h1 className="text-6xl font-bold text-amber-100 drop-shadow-2xl">Kingdom Dice</h1>
            <Dice1 className="w-12 h-12 text-amber-400 animate-flicker" />
          </div>
          <p className="text-xl text-amber-200 max-w-lg mx-auto leading-relaxed drop-shadow">
            Roll the dice and build scoring combinations in this medieval-inspired dice game
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="space-y-6">
          <div className="wooden-panel rounded-xl overflow-hidden tavern-glow">
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 p-6 border-b-2 border-amber-700">
              <h2 className="text-2xl font-semibold text-center flex items-center justify-center gap-3 drop-shadow">
                <Play className="w-6 h-6" />
                Choose Game Mode
              </h2>
            </div>

            <div className="p-8 space-y-4 bg-wood-medium wood-grain">
              {/* Player vs Player */}
              <button
                onClick={handlePlayerVsPlayer}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 text-amber-100 rounded-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 border-blue-700 hover:border-blue-600"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-4">
                  <Users className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="text-xl font-semibold mb-1 drop-shadow">Player vs Player</h3>
                    <p className="text-blue-200 text-sm">Challenge friends in local multiplayer</p>
                  </div>
                </div>
              </button>

              {/* Player vs AI */}
              <button
                onClick={handlePlayerVsAI}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 text-amber-100 rounded-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 border-purple-700 hover:border-purple-600"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-4">
                  <Bot className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="text-xl font-semibold mb-1 drop-shadow">Player vs AI</h3>
                    <p className="text-purple-200 text-sm">Test your skills against computer opponents</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Difficulty Preview */}
          <div className="wooden-panel rounded-lg p-6 tavern-glow">
            <h3 className="text-lg font-semibold text-amber-100 mb-4 flex items-center gap-2 drop-shadow">
              <Brain className="w-5 h-5" />
              AI Opponents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900 bg-opacity-50 rounded-lg p-4 border border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <h4 className="font-medium text-green-300">Easy AI</h4>
                </div>
                <ul className="text-sm text-green-200 space-y-1">
                  <li>• Makes occasional mistakes</li>
                  <li>• Conservative play style</li>
                  <li>• Good for beginners</li>
                </ul>
              </div>
              <div className="bg-red-900 bg-opacity-50 rounded-lg p-4 border border-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-red-400" />
                  <h4 className="font-medium text-red-300">Hard AI</h4>
                </div>
                <ul className="text-sm text-red-200 space-y-1">
                  <li>• Optimal decision making</li>
                  <li>• Aggressive when needed</li>
                  <li>• Challenging opponent</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Game Rules Preview */}
          <div className="wooden-panel rounded-lg p-6 tavern-glow">
            <h3 className="text-lg font-semibold text-amber-100 mb-4 flex items-center gap-2 drop-shadow">
              <Settings className="w-5 h-5" />
              Quick Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-300">
              <div>
                <h4 className="font-medium text-amber-200 mb-1">Scoring</h4>
                <ul className="space-y-1">
                  <li>• Single 1: 100 pts</li>
                  <li>• Single 5: 50 pts</li>
                  <li>• Three 1s: 1,000 pts</li>
                  <li>• Three of a kind: 100-600 pts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-amber-200 mb-1">Special</h4>
                <ul className="space-y-1">
                  <li>• Straight 1-5: 500 pts</li>
                  <li>• Straight 2-6: 750 pts</li>
                  <li>• Full straight: 1,500 pts</li>
                  <li>• Four+ of a kind: 2x points</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && selectedMode && (
        <GameSettingsModal
          gameMode={selectedMode}
          onStartGame={handleStartWithSettings}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
}