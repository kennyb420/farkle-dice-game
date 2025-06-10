import React, { useState } from 'react';
import { Dice1, Users, Settings, Play } from 'lucide-react';
import { GameSettings } from '../types/game';
import { GameSettingsModal } from './GameSettingsModal';

interface MainMenuProps {
  onStartGame: (settings: GameSettings) => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handlePlayerVsPlayer = () => {
    setShowSettings(true);
  };

  const handleStartWithSettings = (settings: GameSettings) => {
    setShowSettings(false);
    onStartGame(settings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Dice1 className="w-12 h-12 text-amber-600" />
            <h1 className="text-5xl font-bold text-stone-800">Kingdom Dice</h1>
            <Dice1 className="w-12 h-12 text-amber-600" />
          </div>
          <p className="text-xl text-stone-600 max-w-lg mx-auto leading-relaxed">
            Roll the dice and build scoring combinations in this medieval-inspired dice game
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6">
              <h2 className="text-2xl font-semibold text-center flex items-center justify-center gap-3">
                <Play className="w-6 h-6" />
                Choose Game Mode
              </h2>
            </div>

            <div className="p-8">
              <button
                onClick={handlePlayerVsPlayer}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-4">
                  <Users className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="text-xl font-semibold mb-1">Player vs Player</h3>
                    <p className="text-blue-100 text-sm">Challenge friends in local multiplayer</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Game Rules Preview */}
          <div className="bg-white rounded-lg shadow border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
              <div>
                <h4 className="font-medium text-stone-700 mb-1">Scoring</h4>
                <ul className="space-y-1">
                  <li>• Single 1: 100 pts</li>
                  <li>• Single 5: 50 pts</li>
                  <li>• Three 1s: 1,000 pts</li>
                  <li>• Three of a kind: 100-600 pts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-stone-700 mb-1">Special</h4>
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
      {showSettings && (
        <GameSettingsModal
          onStartGame={handleStartWithSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}