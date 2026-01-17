import { DifficultyLevel } from '../../types';

export interface DifficultyConfig {
  searchDepth: number;
  useTranspositionTable: boolean;
  useMoveOrdering: boolean;
  evaluationAccuracy: number;
  randomness: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  [DifficultyLevel.EASY]: {
    searchDepth: 2,
    useTranspositionTable: false,
    useMoveOrdering: false,
    evaluationAccuracy: 0.7,
    randomness: 0.3
  },
  [DifficultyLevel.MEDIUM]: {
    searchDepth: 3,
    useTranspositionTable: true,
    useMoveOrdering: true,
    evaluationAccuracy: 0.9,
    randomness: 0.1
  },
  [DifficultyLevel.HARD]: {
    searchDepth: 4,
    useTranspositionTable: true,
    useMoveOrdering: true,
    evaluationAccuracy: 1.0,
    randomness: 0
  }
};
