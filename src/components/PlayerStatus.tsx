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
            p-4 rounded-lg border-2 transition-all duration-300
            ${index === currentPlayerIndex && !gameWinner
              ? player.isAI 
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-stone-200 bg-white'
            }
            ${gameWinner?.id === player.id ? 'border-gold-500 bg-gold-50 shadow-lg' : ''}
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            {gameWinner?.id === player.id ? (
              <Crown className="w-5 h-5 text-gold-600" />
            ) : player.isAI ? (
              <Bot className="w-5 h-5 text-purple-600" />
            ) : (
              <User className="w-5 h-5 text-stone-600" />
            )}
            <h3 className="font-semibold text-stone-800">{player.name}</h3>
            {index === currentPlayerIndex && !gameWinner && (
              <span className={`px-2 py-1 text-white text-xs rounded-full ${
                player.isAI ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
                Current
              </span>
            )}
            {gameWinner?.id === player.id && (
              <span className="px-2 py-1 bg-gold-500 text-white text-xs rounded-full">
                Winner!
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Total Score:</span>
              <span className="font-medium">{player.totalScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Turn Score:</span>
              <span className="font-medium text-green-600">+{player.turnScore}</span>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  player.isAI ? 'bg-purple-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (player.totalScore / targetScore) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-stone-500 mt-1">
              {Math.max(0, targetScore - player.totalScore).toLocaleString()} to win
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}