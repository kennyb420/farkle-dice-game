import React, { useState } from 'react';
import { Player } from '../types/game';
import { ChevronDown, ChevronUp, History, Trophy, Target } from 'lucide-react';

interface ScoreHistoryProps {
  players: Player[];
  currentPlayerIndex: number;
}

export function ScoreHistory({ players, currentPlayerIndex }: ScoreHistoryProps) {
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  const togglePlayerHistory = (playerId: number) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  const getPlayerRank = (player: Player) => {
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    return sortedPlayers.findIndex(p => p.id === player.id) + 1;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-stone-200 mb-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
          <History className="w-5 h-5" />
          Score History
        </h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {players.map((player, playerIndex) => {
            const isExpanded = expandedPlayer === player.id;
            const isCurrentPlayer = currentPlayerIndex === playerIndex; // FIXED: Use playerIndex instead of player.id - 1
            const rank = getPlayerRank(player);
            const hasHistory = player.scoreHistory.length > 0;

            return (
              <div
                key={player.id}
                className={`
                  border-2 rounded-lg transition-all duration-200
                  ${isCurrentPlayer 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-stone-200 bg-white hover:border-stone-300'
                  }
                `}
              >
                {/* Player Header */}
                <button
                  onClick={() => hasHistory && togglePlayerHistory(player.id)}
                  className={`
                    w-full p-4 text-left transition-colors rounded-lg
                    ${hasHistory ? 'hover:bg-stone-50 cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getRankIcon(rank)}</span>
                        <span className="font-semibold text-stone-800">{player.name}</span>
                        {isCurrentPlayer && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg text-stone-800">
                          {player.totalScore.toLocaleString()}
                        </div>
                        <div className="text-sm text-stone-500">
                          {player.scoreHistory.length} turn{player.scoreHistory.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      {hasHistory && (
                        <div className="text-stone-400">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded History */}
                {isExpanded && hasHistory && (
                  <div className="border-t border-stone-200 bg-stone-50">
                    <div className="p-4 space-y-3">
                      <h4 className="font-medium text-stone-700 text-sm flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Turn-by-Turn Breakdown
                      </h4>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {player.scoreHistory.map((turn, index) => (
                          <div
                            key={turn.turnNumber}
                            className="bg-white rounded-lg p-3 border border-stone-200"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-stone-700 text-sm">
                                Turn {turn.turnNumber}
                              </span>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">
                                  +{turn.score.toLocaleString()}
                                </div>
                                <div className="text-xs text-stone-500">
                                  Total: {turn.totalScoreAfter.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            
                            {turn.combinations.length > 0 && (
                              <div className="space-y-1">
                                {/* Group by lock group */}
                                {Array.from(new Set(turn.combinations.map(c => c.lockGroup))).map(lockGroup => {
                                  const groupCombos = turn.combinations.filter(c => c.lockGroup === lockGroup);
                                  const groupTotal = groupCombos.reduce((sum, combo) => sum + combo.points, 0);
                                  
                                  return (
                                    <div key={lockGroup} className="bg-stone-50 rounded p-2">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-stone-500">
                                          Roll #{lockGroup + 1}
                                        </span>
                                        <span className="text-xs font-medium text-green-600">
                                          +{groupTotal}
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        {groupCombos.map((combo, comboIndex) => (
                                          <div key={comboIndex} className="flex justify-between text-xs">
                                            <span className="text-stone-600">{combo.description}</span>
                                            <span className="text-green-600 font-medium">+{combo.points}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {player.scoreHistory.length > 3 && (
                        <div className="text-center">
                          <div className="text-xs text-stone-500 bg-white rounded px-2 py-1 inline-block">
                            Scroll to see all {player.scoreHistory.length} turns
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No History Message */}
                {!hasHistory && (
                  <div className="border-t border-stone-200 p-3 text-center text-stone-500 text-sm">
                    No completed turns yet
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Game Summary */}
        {players.some(p => p.scoreHistory.length > 0) && (
          <div className="mt-6 pt-4 border-t border-stone-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-stone-50 rounded-lg p-3">
                <div className="text-lg font-bold text-stone-800">
                  {Math.max(...players.map(p => p.scoreHistory.length))}
                </div>
                <div className="text-xs text-stone-600">Max Turns</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3">
                <div className="text-lg font-bold text-stone-800">
                  {Math.max(...players.map(p => p.scoreHistory.reduce((max, turn) => Math.max(max, turn.score), 0))).toLocaleString()}
                </div>
                <div className="text-xs text-stone-600">Best Turn</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3">
                <div className="text-lg font-bold text-stone-800">
                  {players.reduce((total, p) => total + p.scoreHistory.length, 0)}
                </div>
                <div className="text-xs text-stone-600">Total Turns</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3">
                <div className="text-lg font-bold text-stone-800">
                  {Math.max(...players.map(p => p.totalScore)).toLocaleString()}
                </div>
                <div className="text-xs text-stone-600">High Score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}