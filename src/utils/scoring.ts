import { Die } from '../types/game';

export interface ScoringCombination {
  dice: number[];
  points: number;
  description: string;
}

export function calculateScore(dice: Die[]): { combinations: ScoringCombination[], totalScore: number } {
  const values = dice.map(d => d.value).sort();
  const counts = new Array(7).fill(0);
  
  values.forEach(value => counts[value]++);
  
  const combinations: ScoringCombination[] = [];
  let totalScore = 0;

  // Check for straights first (they use all dice)
  if (arraysEqual(values, [1, 2, 3, 4, 5, 6])) {
    combinations.push({
      dice: dice.map(d => d.id),
      points: 1500,
      description: 'Full Straight (1-6)'
    });
    return { combinations, totalScore: 1500 };
  }
  
  if (arraysEqual(values, [1, 2, 3, 4, 5])) {
    combinations.push({
      dice: dice.filter(d => d.value <= 5).map(d => d.id),
      points: 500,
      description: 'Partial Straight (1-5)'
    });
    return { combinations, totalScore: 500 };
  }
  
  if (arraysEqual(values, [2, 3, 4, 5, 6])) {
    combinations.push({
      dice: dice.filter(d => d.value >= 2).map(d => d.id),
      points: 750,
      description: 'Partial Straight (2-6)'
    });
    return { combinations, totalScore: 750 };
  }

  // Track which dice are used
  const usedDice = new Set<number>();

  // Check for multiples (3 or more of a kind)
  for (let value = 1; value <= 6; value++) {
    if (counts[value] >= 3) {
      const baseScore = value === 1 ? 1000 : value * 100;
      let score = baseScore;
      
      // Four or more of a kind doubles the points
      if (counts[value] >= 4) {
        score = baseScore * 2;
      }
      
      // Find the dice for this combination
      const diceForCombination = dice
        .filter(d => d.value === value)
        .slice(0, counts[value])
        .map(d => d.id);
      
      diceForCombination.forEach(id => usedDice.add(id));
      
      combinations.push({
        dice: diceForCombination,
        points: score,
        description: `${counts[value]} ${value}s`
      });
      
      totalScore += score;
    }
  }

  // Check for individual 1s and 5s (not part of multiples)
  const remaining1s = Math.max(0, counts[1] - (counts[1] >= 3 ? counts[1] : 0));
  const remaining5s = Math.max(0, counts[5] - (counts[5] >= 3 ? counts[5] : 0));
  
  if (remaining1s > 0) {
    const dice1s = dice
      .filter(d => d.value === 1 && !usedDice.has(d.id))
      .slice(0, remaining1s);
    
    dice1s.forEach(d => usedDice.add(d.id));
    
    combinations.push({
      dice: dice1s.map(d => d.id),
      points: remaining1s * 100,
      description: `${remaining1s} single 1${remaining1s > 1 ? 's' : ''}`
    });
    
    totalScore += remaining1s * 100;
  }
  
  if (remaining5s > 0) {
    const dice5s = dice
      .filter(d => d.value === 5 && !usedDice.has(d.id))
      .slice(0, remaining5s);
    
    dice5s.forEach(d => usedDice.add(d.id));
    
    combinations.push({
      dice: dice5s.map(d => d.id),
      points: remaining5s * 50,
      description: `${remaining5s} single 5${remaining5s > 1 ? 's' : ''}`
    });
    
    totalScore += remaining5s * 50;
  }

  return { combinations, totalScore };
}

export function hasAnyScore(dice: Die[]): boolean {
  const { totalScore } = calculateScore(dice);
  return totalScore > 0;
}

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

export function getAutoSelectableDice(dice: Die[]): number[] {
  const { combinations } = calculateScore(dice);
  const selectableDice = new Set<number>();
  
  combinations.forEach(combo => {
    combo.dice.forEach(diceId => selectableDice.add(diceId));
  });
  
  return Array.from(selectableDice);
}