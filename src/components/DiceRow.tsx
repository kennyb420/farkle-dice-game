import React from 'react';
import { Dice } from './Dice';
import { Die } from '../types/game';

interface DiceRowProps {
  dice: Die[];
  onToggleDie: (id: number) => void;
  isRolling: boolean;
}

export function DiceRow({ dice, onToggleDie, isRolling }: DiceRowProps) {
  return (
    <div className="flex justify-center gap-3 p-6">
      {dice.map((die) => (
        <Dice
          key={die.id}
          die={die}
          onToggle={onToggleDie}
          isRolling={isRolling}
        />
      ))}
    </div>
  );
}