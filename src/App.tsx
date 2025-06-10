import React, { useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { DiceRow } from './components/DiceRow';
import { ScoreDisplay } from './components/ScoreDisplay';
import { PlayerStatus } from './components/PlayerStatus';
import { GameControls } from './components/GameControls';
import { MainMenu } from './components/MainMenu';
import { Dice1, ArrowLeft } from 'lucide-react';

function App() {
  const {
    gameMode,
    gameState,
    startGame,
    returnToMenu,
    rollDice,
    toggleDie,
    endTurn,
    calculateTurnScore,
    autoSelectScoring,
    startNewGame
  } = useGameLogic();

  // Calculate turn score whenever held dice change
  useEffect(() => {
    if (gameMode === 'playing') {
      calculateTurnScore();
    }
  }, [gameState.dice, calculateTurnScore, gameMode]);

  if (gameMode === 'menu') {
    return <MainMenu onStartGame={startGame} />;
  }

  const heldDice = gameState.dice.filter(d => d.isHeld || d.isLocked);
  const hasHeldDice = heldDice.length > 0;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={returnToMenu}
            className="absolute left-0 top-0 flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Menu
          </button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Dice1 className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-stone-800">Kingdom Dice</h1>
            <Dice1 className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Roll the dice and build scoring combinations. First to {gameState.targetScore.toLocaleString()} points wins!
          </p>
        </div>

        {/* Player Status */}
        <PlayerStatus
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          targetScore={gameState.targetScore}
          gameWinner={gameState.gameWinner}
        />

        {/* Game Board */}
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4">
            <h2 className="text-xl font-semibold text-center">
              {gameState.gameWinner 
                ? `🎉 ${gameState.gameWinner.name} Wins! 🎉`
                : `${currentPlayer.name}'s Turn`
              }
            </h2>
          </div>

          {/* Dice Area */}
          <DiceRow
            dice={gameState.dice}
            onToggleDie={toggleDie}
            isRolling={gameState.isRolling}
            hasRolledThisTurn={gameState.hasRolledThisTurn}
          />

          {/* Score Display */}
          <div className="px-6 pb-4">
            <ScoreDisplay
              heldDice={heldDice}
              turnScore={currentPlayer.turnScore}
              currentPlayer={currentPlayer}
            />
          </div>

          {/* Game Controls */}
          <div className="p-6 bg-stone-50 border-t border-stone-200">
            <GameControls
              onRoll={rollDice}
              onEndTurn={endTurn}
              onAutoSelect={autoSelectScoring}
              onNewGame={startNewGame}
              canRoll={gameState.canRoll}
              isRolling={gameState.isRolling}
              dice={gameState.dice}
              gameWinner={gameState.gameWinner}
              hasHeldDice={hasHeldDice}
              hasRolledThisTurn={gameState.hasRolledThisTurn}
            />
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-white rounded-lg shadow border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Scoring Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium text-stone-700">Singles</h4>
              <div className="text-stone-600">
                <div>Single 1: 100 pts</div>
                <div>Single 5: 50 pts</div>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-stone-700">Straights</h4>
              <div className="text-stone-600">
                <div>1-2-3-4-5: 500 pts</div>
                <div>2-3-4-5-6: 750 pts</div>
                <div>1-2-3-4-5-6: 1,500 pts</div>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-stone-700">Three of a Kind</h4>
              <div className="text-stone-600">
                <div>Three 1s: 1,000 pts</div>
                <div>Three 2s: 200 pts</div>
                <div>Three 3s: 300 pts</div>
                <div>Three 4s: 400 pts</div>
                <div>Three 5s: 500 pts</div>
                <div>Three 6s: 600 pts</div>
                <div className="text-amber-600 font-medium">Four+ of a kind: 2x points</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-stone-200">
            <h4 className="font-medium text-stone-700 mb-2">Instant Lock Rules</h4>
            <ul className="text-sm text-stone-600 space-y-1">
              <li>• Click dice after rolling to instantly lock them (📌)</li>
              <li>• Locked dice can be unlocked by clicking again before rolling</li>
              <li>• Once you roll, all locked dice become permanently locked (🔒)</li>
              <li>• <strong>Scoring combinations are calculated separately for each roll</strong></li>
              <li>• If all dice are locked, player gets a fresh set of 6 dice</li>
              <li>• Rolling with no scoring combinations results in a bust</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;