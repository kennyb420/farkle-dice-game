import React, { useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { DiceRow } from './components/DiceRow';
import { ScoreDisplay } from './components/ScoreDisplay';
import { PlayerStatus } from './components/PlayerStatus';
import { GameControls } from './components/GameControls';
import { MainMenu } from './components/MainMenu';
import { BoltBadge } from './components/BoltBadge';
import { ErrorBoundary, GameErrorBoundary, ComponentErrorBoundary } from './components/ErrorBoundary';
import { Dice1, ArrowLeft, Bot, Brain } from 'lucide-react';

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

  // Announce game state changes to screen readers
  useEffect(() => {
    if (gameMode === 'playing' && gameState.gameWinner) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Game over! ${gameState.gameWinner.name} wins with ${gameState.gameWinner.totalScore} points!`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 3000);
    }
  }, [gameState.gameWinner, gameMode]);

  if (gameMode === 'menu') {
    return (
      <ErrorBoundary>
        <MainMenu onStartGame={startGame} />
        <BoltBadge />
      </ErrorBoundary>
    );
  }

  const heldDice = gameState.dice.filter(d => d.isHeld || d.isLocked);
  const hasHeldDice = heldDice.length > 0;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <GameErrorBoundary>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <ComponentErrorBoundary componentName="Game Header">
            <div className="text-center mb-8 relative">
              <button
                onClick={returnToMenu}
                className="absolute left-0 top-0 flex items-center gap-2 px-4 py-2 tavern-button rounded-lg focus:ring-2 focus:ring-amber-500"
                aria-label="Return to main menu"
              >
                <ArrowLeft className="w-4 h-4" />
                Menu
              </button>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Dice1 className="w-8 h-8 text-amber-400 animate-flicker" aria-hidden="true" />
                <h1 className="text-4xl font-bold text-amber-100 drop-shadow-lg">Kingdom Dice</h1>
                <Dice1 className="w-8 h-8 text-amber-400 animate-flicker" aria-hidden="true" />
              </div>
              <p className="text-amber-200 max-w-2xl mx-auto drop-shadow">
                Roll the dice and build scoring combinations. First to {gameState.targetScore.toLocaleString()} points wins!
              </p>
            </div>
          </ComponentErrorBoundary>

          {/* Player Status */}
          <ComponentErrorBoundary componentName="Player Status">
            <PlayerStatus
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
              targetScore={gameState.targetScore}
              gameWinner={gameState.gameWinner}
            />
          </ComponentErrorBoundary>

          {/* Game Board */}
          <ComponentErrorBoundary componentName="Game Board">
            <div className="wooden-panel rounded-xl overflow-hidden mb-6 tavern-glow">
              <div className={`text-amber-100 p-4 ${
                currentPlayer.isAI 
                  ? 'bg-gradient-to-r from-purple-800 to-purple-900 border-b-2 border-purple-700' 
                  : 'bg-gradient-to-r from-amber-800 to-amber-900 border-b-2 border-amber-700'
              }`}>
                <h2 
                  className="text-xl font-semibold text-center flex items-center justify-center gap-2 drop-shadow"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {gameState.gameWinner ? (
                    `🎉 ${gameState.gameWinner.name} Wins! 🎉`
                  ) : (
                    <>
                      {currentPlayer.isAI && <Bot className="w-5 h-5" aria-hidden="true" />}
                      {`${currentPlayer.name}'s Turn`}
                      {gameState.aiThinking && (
                        <div className="flex items-center gap-2 ml-2">
                          <Brain className="w-4 h-4 animate-pulse" aria-hidden="true" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      )}
                    </>
                  )}
                </h2>
              </div>

              {/* Dice Area */}
              <div className="bg-wood-dark wood-grain p-6">
                <ComponentErrorBoundary componentName="Dice Row">
                  <DiceRow
                    dice={gameState.dice}
                    onToggleDie={toggleDie}
                    isRolling={gameState.isRolling}
                    hasRolledThisTurn={gameState.hasRolledThisTurn}
                  />
                </ComponentErrorBoundary>
              </div>

              {/* Score Display */}
              <div className="px-6 pb-4 bg-wood-medium wood-grain">
                <ComponentErrorBoundary componentName="Score Display">
                  <ScoreDisplay
                    heldDice={heldDice}
                    turnScore={currentPlayer.turnScore}
                    currentPlayer={currentPlayer}
                  />
                </ComponentErrorBoundary>
              </div>

              {/* Game Controls */}
              <div className="p-6 bg-wood-light wood-grain border-t-2 border-amber-800">
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
                  isAITurn={gameState.isAITurn}
                  aiThinking={gameState.aiThinking}
                />
              </div>
            </div>
          </ComponentErrorBoundary>

          {/* Game Rules */}
          <ComponentErrorBoundary componentName="Game Rules">
            <div className="wooden-panel rounded-lg p-6 tavern-glow">
              <h3 className="text-lg font-semibold text-amber-100 mb-4 drop-shadow">Scoring Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <h4 className="font-medium text-amber-200">Singles</h4>
                  <div className="text-amber-300">
                    <div>Single 1: 100 pts</div>
                    <div>Single 5: 50 pts</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-amber-200">Straights</h4>
                  <div className="text-amber-300">
                    <div>1-2-3-4-5: 500 pts</div>
                    <div>2-3-4-5-6: 750 pts</div>
                    <div>1-2-3-4-5-6: 1,500 pts</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-amber-200">Three of a Kind</h4>
                  <div className="text-amber-300">
                    <div>Three 1s: 1,000 pts</div>
                    <div>Three 2s: 200 pts</div>
                    <div>Three 3s: 300 pts</div>
                    <div>Three 4s: 400 pts</div>
                    <div>Three 5s: 500 pts</div>
                    <div>Three 6s: 600 pts</div>
                    <div className="text-gold-400 font-medium">Four+ of a kind: 2x points</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-amber-700">
                <h4 className="font-medium text-amber-200 mb-2">Special Rules</h4>
                <ul className="text-sm text-amber-300 space-y-1">
                  <li>• Click dice after rolling to instantly lock them (📌)</li>
                  <li>• Locked dice can be unlocked by clicking again before rolling</li>
                  <li>• Once you roll, all locked dice become permanently locked (🔒)</li>
                  <li>• <strong>Scoring combinations are calculated separately for each roll</strong></li>
                  <li>• <strong className="text-gold-400">🎉 BONUS: If all 6 dice are locked, you get fresh dice and continue your turn!</strong></li>
                  <li>• Rolling with no scoring combinations results in a bust</li>
                </ul>
              </div>
            </div>
          </ComponentErrorBoundary>
        </div>
      </div>
      <BoltBadge />
    </GameErrorBoundary>
  );
}

export default App;