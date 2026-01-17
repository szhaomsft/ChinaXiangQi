import { Board } from '../../core/board/Board';
import { Move } from '../../core/move/Move';
import { Color, oppositeColor } from '../../types';
import { MoveGenerator } from '../../core/move/MoveGenerator';
import { Evaluator } from '../evaluation/Evaluator';
import { DifficultyLevel } from '../../types';
import { DIFFICULTY_CONFIGS } from '../difficulty/DifficultyConfig';
import { CHECKMATE_SCORE, INFINITY_SCORE } from '../../utils/constants';
import { TranspositionTable, TTEntryType } from './TranspositionTable';
import { MoveOrdering } from './MoveOrdering';

export class AIEngine {
  private moveGenerator: MoveGenerator;
  private evaluator: Evaluator;
  private transpositionTable: TranspositionTable;
  private moveOrdering: MoveOrdering;
  private nodesSearched: number = 0;

  constructor() {
    this.moveGenerator = new MoveGenerator();
    this.evaluator = new Evaluator();
    this.transpositionTable = new TranspositionTable();
    this.moveOrdering = new MoveOrdering();
  }

  async findBestMove(
    board: Board,
    color: Color,
    difficulty: DifficultyLevel
  ): Promise<Move> {
    const config = DIFFICULTY_CONFIGS[difficulty];
    this.nodesSearched = 0;

    const moves = this.moveGenerator.generateLegalMoves(board, color);

    if (moves.length === 0) {
      throw new Error('No legal moves available');
    }

    if (moves.length === 1) {
      return moves[0];
    }

    let bestMove = moves[0];
    let bestScore = -INFINITY_SCORE;

    // 迭代加深搜索
    for (let depth = 1; depth <= config.searchDepth; depth++) {
      let currentBestMove = bestMove;
      let currentBestScore = -INFINITY_SCORE;

      // 获取置换表中的最佳走法
      const ttBestMove = this.transpositionTable.getBestMove(board.getHash());

      // 走法排序
      const orderedMoves = config.useMoveOrdering
        ? this.moveOrdering.orderMoves(moves, depth, ttBestMove)
        : moves;

      for (const move of orderedMoves) {
        const testBoard = board.clone();
        this.moveGenerator.makeMove(testBoard, move);

        const score = -this.alphaBeta(
          testBoard,
          depth - 1,
          -INFINITY_SCORE,
          INFINITY_SCORE,
          oppositeColor(color),
          config.useTranspositionTable,
          config.useMoveOrdering
        );

        if (score > currentBestScore) {
          currentBestScore = score;
          currentBestMove = move;
        }
      }

      bestMove = currentBestMove;
      bestScore = currentBestScore;

      // 如果找到必胜走法，提前返回
      if (bestScore > CHECKMATE_SCORE - 100) {
        break;
      }
    }

    // 添加随机性（简单和中等难度）
    if (config.randomness > 0 && Math.random() < config.randomness) {
      const topMoves = moves.slice(0, Math.min(3, moves.length));
      bestMove = topMoves[Math.floor(Math.random() * topMoves.length)];
    }

    console.log(`🤖 AI搜索节点数: ${this.nodesSearched}, 最佳分数: ${bestScore}`);

    return bestMove;
  }

  private alphaBeta(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    color: Color,
    useTranspositionTable: boolean,
    useMoveOrdering: boolean
  ): number {
    this.nodesSearched++;

    const boardHash = board.getHash();

    // 置换表查询
    if (useTranspositionTable) {
      const ttScore = this.transpositionTable.probe(boardHash, depth, alpha, beta);
      if (ttScore !== null) {
        return ttScore;
      }
    }

    // 到达叶子节点，使用静态搜索
    if (depth === 0) {
      return this.quiescence(board, alpha, beta, color, 2);
    }

    const moves = this.moveGenerator.generateLegalMoves(board, color);

    // 无走法可走
    if (moves.length === 0) {
      return -CHECKMATE_SCORE;
    }

    // 获取置换表最佳走法
    const ttBestMove = useTranspositionTable
      ? this.transpositionTable.getBestMove(boardHash)
      : null;

    // 走法排序
    const orderedMoves = useMoveOrdering
      ? this.moveOrdering.orderMoves(moves, depth, ttBestMove)
      : moves;

    let maxScore = -INFINITY_SCORE;
    let bestMove: Move | null = null;
    let entryType = TTEntryType.UPPER_BOUND;

    for (const move of orderedMoves) {
      const testBoard = board.clone();
      this.moveGenerator.makeMove(testBoard, move);

      const score = -this.alphaBeta(
        testBoard,
        depth - 1,
        -beta,
        -alpha,
        oppositeColor(color),
        useTranspositionTable,
        useMoveOrdering
      );

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }

      alpha = Math.max(alpha, score);

      if (alpha >= beta) {
        // Beta剪枝
        if (useMoveOrdering) {
          this.moveOrdering.addKillerMove(move, depth);
        }
        entryType = TTEntryType.LOWER_BOUND;
        break;
      }
    }

    if (maxScore > alpha) {
      entryType = TTEntryType.EXACT;
    }

    // 存储到置换表
    if (useTranspositionTable) {
      this.transpositionTable.store(boardHash, depth, maxScore, entryType, bestMove);
    }

    // 更新历史启发
    if (useMoveOrdering && bestMove && entryType === TTEntryType.LOWER_BOUND) {
      this.moveOrdering.updateHistory(bestMove, depth);
    }

    return maxScore;
  }

  // 静态搜索（避免水平线效应）
  private quiescence(
    board: Board,
    alpha: number,
    beta: number,
    color: Color,
    depth: number
  ): number {
    this.nodesSearched++;

    // 站立评估
    const standPat = this.evaluator.evaluate(board, color);

    if (depth === 0) {
      return standPat;
    }

    if (standPat >= beta) {
      return beta;
    }

    if (standPat > alpha) {
      alpha = standPat;
    }

    // 只搜索吃子走法
    const captureMoves = this.moveGenerator.generateCaptureMoves(board, color);

    for (const move of captureMoves) {
      const testBoard = board.clone();
      this.moveGenerator.makeMove(testBoard, move);

      const score = -this.quiescence(testBoard, -beta, -alpha, oppositeColor(color), depth - 1);

      if (score >= beta) {
        return beta;
      }

      if (score > alpha) {
        alpha = score;
      }
    }

    return alpha;
  }
}
