import { Board } from '../../core/board/Board';
import { Move } from '../../core/move/Move';
import { Color, oppositeColor } from '../../types';
import { MoveGenerator } from '../../core/move/MoveGenerator';
import { Evaluator } from '../evaluation/Evaluator';
import { DifficultyLevel } from '../../types';
import { DIFFICULTY_CONFIGS } from '../difficulty/DifficultyConfig';
import { CHECKMATE_SCORE, INFINITY_SCORE } from '../../utils/constants';

export class AIEngine {
  private moveGenerator: MoveGenerator;
  private evaluator: Evaluator;

  constructor() {
    this.moveGenerator = new MoveGenerator();
    this.evaluator = new Evaluator();
  }

  async findBestMove(
    board: Board,
    color: Color,
    difficulty: DifficultyLevel
  ): Promise<Move> {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const moves = this.moveGenerator.generateLegalMoves(board, color);

    if (moves.length === 0) {
      throw new Error('No legal moves available');
    }

    let bestMove = moves[0];
    let bestScore = -INFINITY_SCORE;

    for (const move of moves) {
      const testBoard = board.clone();
      this.moveGenerator.makeMove(testBoard, move);

      const score = -this.minimax(
        testBoard,
        config.searchDepth - 1,
        -INFINITY_SCORE,
        INFINITY_SCORE,
        oppositeColor(color)
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    // 添加随机性
    if (config.randomness > 0 && Math.random() < config.randomness) {
      bestMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))];
    }

    return bestMove;
  }

  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    color: Color
  ): number {
    if (depth === 0) {
      return this.evaluator.evaluate(board, color);
    }

    const moves = this.moveGenerator.generateLegalMoves(board, color);

    if (moves.length === 0) {
      return -CHECKMATE_SCORE;
    }

    let maxScore = -INFINITY_SCORE;

    for (const move of moves) {
      const testBoard = board.clone();
      this.moveGenerator.makeMove(testBoard, move);

      const score = -this.minimax(
        testBoard,
        depth - 1,
        -beta,
        -alpha,
        oppositeColor(color)
      );

      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);

      if (alpha >= beta) {
        break; // Alpha-beta剪枝
      }
    }

    return maxScore;
  }
}
