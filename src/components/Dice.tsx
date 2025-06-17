import React from 'react';
import { Die } from '../types/game';

interface DiceProps {
  die: Die;
  onToggle: (id: number) => void;
  isRolling: boolean;
  hasRolledThisTurn: boolean;
}

export function Dice({ die, onToggle, isRolling, hasRolledThisTurn }: DiceProps) {
  const getDotPositions = (value: number) => {
    const positions = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };
    return positions[value as keyof typeof positions] || [];
  };

  // Can toggle if: has rolled this turn, not rolling, and not permanently locked
  const canToggle = hasRolledThisTurn && !isRolling && !die.isLocked;

  // Generate accessible description
  const getAriaLabel = () => {
    const baseLabel = `Die ${die.id + 1} showing ${die.value}`;
    
    if (die.isLocked) {
      return `${baseLabel}, permanently locked this turn`;
    } else if (die.isHeld) {
      return `${baseLabel}, selected for scoring, click to unselect`;
    } else if (canToggle) {
      return `${baseLabel}, available for selection, click to select for scoring`;
    } else {
      return `${baseLabel}, not available for selection`;
    }
  };

  const getAriaPressed = () => {
    if (die.isLocked) return undefined; // Locked dice don't have pressed state
    return die.isHeld;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (canToggle) {
        onToggle(die.id);
      }
    }
  };

  const handleClick = () => {
    if (canToggle) {
      onToggle(die.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative w-16 h-16 rounded-lg border-2 transition-all duration-300 
        ${die.isLocked
          ? 'bg-gradient-to-br from-red-100 to-red-200 border-red-600 shadow-lg shadow-red-600/30 scale-105' 
          : die.isHeld
          ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-600 shadow-lg shadow-amber-600/30 scale-105'
          : 'bg-gradient-to-br from-stone-100 to-stone-200 border-stone-400 hover:border-stone-500 hover:shadow-md shadow-lg'
        }
        ${die.isScoring ? 'ring-2 ring-green-400 ring-opacity-75' : ''}
        ${isRolling ? 'animate-spin' : ''}
        ${canToggle ? 'cursor-pointer hover:scale-110 focus:scale-110' : 'cursor-not-allowed'}
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
        tavern-glow
      `}
      disabled={!canToggle}
      aria-label={getAriaLabel()}
      aria-pressed={getAriaPressed()}
      role={die.isLocked ? 'img' : 'button'}
      tabIndex={canToggle ? 0 : -1}
      aria-describedby={`die-${die.id}-status`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {getDotPositions(die.value).map((position, index) => (
          <div
            key={index}
            className={`
              absolute w-2.5 h-2.5 rounded-full shadow-sm
              ${die.isLocked ? 'bg-red-800' : die.isHeld ? 'bg-amber-800' : 'bg-stone-800'}
              ${position === 'top-left' ? 'top-2 left-2' : ''}
              ${position === 'top-right' ? 'top-2 right-2' : ''}
              ${position === 'middle-left' ? 'top-1/2 left-2 -translate-y-1/2' : ''}
              ${position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
              ${position === 'middle-right' ? 'top-1/2 right-2 -translate-y-1/2' : ''}
              ${position === 'bottom-left' ? 'bottom-2 left-2' : ''}
              ${position === 'bottom-right' ? 'bottom-2 right-2' : ''}
            `}
            aria-hidden="true"
          />
        ))}
      </div>
      
      {/* Permanently locked indicator */}
      {die.isLocked && (
        <div 
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg"
          aria-hidden="true"
        >
          <span className="text-white text-xs">🔒</span>
        </div>
      )}
      
      {/* Selected/held indicator (can be toggled) */}
      {die.isHeld && !die.isLocked && (
        <div 
          className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center shadow-lg"
          aria-hidden="true"
        >
          <span className="text-white text-xs">📌</span>
        </div>
      )}

      {/* Screen reader status */}
      <div id={`die-${die.id}-status`} className="sr-only">
        {die.isLocked && 'This die is permanently locked for this turn.'}
        {die.isHeld && !die.isLocked && 'This die is selected for scoring.'}
        {!die.isHeld && !die.isLocked && canToggle && 'This die is available for selection.'}
        {!canToggle && !die.isLocked && 'This die cannot be selected right now.'}
      </div>
    </button>
  );
}