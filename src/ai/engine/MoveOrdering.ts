import { Move } from '../../core/move/Move';
import { PieceType } from '../../types';

export class MoveOrdering {
  private killerMoves: Move[][] = [];
  private historyHeuristic: Map<string, number> = new Map();

  constructor() {
    // 初始化杀手走法表（每层深度保存2个杀手走法）
    for (let i = 0; i < 20; i++) {
      this.killerMoves[i] = [];
    }
  }

  // MVV-LVA（最有价值受害者-最小价值攻击者）评分
  private getMVVLVAScore(move: Move): number {
    if (!move.capturedPiece) return 0;

    const victimValue = this.getPieceValue(move.capturedPiece.type);
    const attackerValue = this.getPieceValue(move.piece.type);

    // 受害者价值越高越好，攻击者价值越低越好
    return victimValue * 100 - attackerValue;
  }

  private getPieceValue(type: PieceType): number {
    switch (type) {
      case PieceType.KING: return 10000;
      case PieceType.ROOK: return 1200;
      case PieceType.CANNON: return 650;
      case PieceType.KNIGHT: return 600;
      case PieceType.ADVISOR: return 250;
      case PieceType.ELEPHANT: return 250;
      case PieceType.PAWN: return 100;
      default: return 0;
    }
  }

  // 对走法进行排序
  orderMoves(moves: Move[], depth: number, ttBestMove: Move | null = null): Move[] {
    const scoredMoves = moves.map(move => ({
      move,
      score: this.scoreMov(move, depth, ttBestMove)
    }));

    // 按分数降序排序
    scoredMoves.sort((a, b) => b.score - a.score);

    return scoredMoves.map(sm => sm.move);
  }

  private scoreMove(move: Move, depth: number, ttBestMove: Move | null): number {
    let score = 0;

    // 1. 置换表最佳走法（最高优先级）
    if (ttBestMove && this.movesEqual(move, ttBestMove)) {
      return 10000000;
    }

    // 2. 吃子走法（MVV-LVA）
    if (move.capturedPiece) {
      score += 1000000 + this.getMVVLVAScore(move);
    }

    // 3. 杀手走法
    if (this.isKillerMove(move, depth)) {
      score += 500000;
    }

    // 4. 历史启发
    const historyScore = this.getHistoryScore(move);
    score += historyScore;

    return score;
  }

  private scoreMov(move: Move, depth: number, ttBestMove: Move | null): number {
    return this.scoreMove(move, depth, ttBestMove);
  }

  private movesEqual(move1: Move, move2: Move): boolean {
    return move1.from.equals(move2.from) && move1.to.equals(move2.to);
  }

  private isKillerMove(move: Move, depth: number): boolean {
    if (depth < 0 || depth >= this.killerMoves.length) return false;
    return this.killerMoves[depth].some(km => this.movesEqual(move, km));
  }

  private getHistoryScore(move: Move): number {
    const key = `${move.from.x},${move.from.y}-${move.to.x},${move.to.y}`;
    return this.historyHeuristic.get(key) || 0;
  }

  // 记录杀手走法
  addKillerMove(move: Move, depth: number): void {
    if (depth < 0 || depth >= this.killerMoves.length) return;
    if (move.capturedPiece) return; // 吃子走法不记录为杀手走法

    const killers = this.killerMoves[depth];

    // 如果已经存在，不重复添加
    if (killers.some(km => this.movesEqual(move, km))) {
      return;
    }

    // 只保留最近的2个杀手走法
    killers.unshift(move);
    if (killers.length > 2) {
      killers.pop();
    }
  }

  // 更新历史启发值
  updateHistory(move: Move, depth: number): void {
    const key = `${move.from.x},${move.from.y}-${move.to.x},${move.to.y}`;
    const bonus = depth * depth; // 深度越深，奖励越大
    const currentScore = this.historyHeuristic.get(key) || 0;
    this.historyHeuristic.set(key, currentScore + bonus);
  }

  clear(): void {
    for (let i = 0; i < this.killerMoves.length; i++) {
      this.killerMoves[i] = [];
    }
    this.historyHeuristic.clear();
  }
}
