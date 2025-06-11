import React from 'react';
import { Player } from '../types/game';
import { Crown, User, Bot } from 'lucide-react';

interface PlayerStatusProps {
  players: Player[];
  currentPlayerIndex: number;
  targetScore: number;
  gameWinner: Player | null;
}

export function PlayerStatus({ players, currentPlayerIndex, targetScore, gameWinner }: PlayerStatusProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {players.map((player, index) => (
        <div
          key={player.id}
          className={`
            wooden-panel p-4 rounded-lg transition-all duration-300
            ${index === currentPlayerIndex && !gameWinner
              ? player.isAI 
                ? 'border-purple-500 bg-purple-900 bg-opacity-30 shadow-lg shadow-purple-500/20'
                : 'border-blue-500 bg-blue-900 bg-opacity-30 shadow-lg shadow-blue-500/20'
              : ''
            }
            ${gameWinner?.id === player.id ? 'border-gold-500 bg-gold-900 bg-opacity-30 shadow-lg shadow-gold-500/20' : ''}
            tavern-glow
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            {gameWinner?.id === player.id ? (
              <Crown className="w-5 h-5 text-gold-400" />
            ) : player.isAI ? (
              <Bot className="w-5 h-5 text-purple-400" />
            ) : (
              <User className="w-5 h-5 text-amber-400" />
            )}
            <h3 className="font-semibold text-amber-100 drop-shadow">{player.name}</h3>
            {index === currentPlayerIndex && !gameWinner && (
              <span className={`px-2 py-1 text-white text-xs rounded-full shadow ${
                player.isAI ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                Current
              </span>
            )}
            {gameWinner?.id === player.id && (
              <span className="px-2 py-1 bg-gold-600 text-white text-xs rounded-full shadow">
                Winner!
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-amber-300">Total Score:</span>
              <span className="font-medium text-amber-100">{player.totalScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amber-300">Turn Score:</span>
              <span className="font-medium text-green-400">+{player.turnScore}</span>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="w-full bg-amber-900 bg-opacity-50 rounded-full h-2 border border-amber-800">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  player.isAI ? 'bg-gradient-to-r from-purple-500 to-purple-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{ width: `${Math.min(100, (player.totalScore / targetScore) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-amber-400 mt-1">
              {Math.max(0, targetScore - player.totalScore).toLocaleString()} to win
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}