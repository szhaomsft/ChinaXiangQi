import { Board } from '../../core/board/Board';
import { Color } from '../../types';
import { PositionTables } from './PositionTables';

export class Evaluator {
  evaluate(board: Board, color: Color): number {
    let score = 0;

    // 1. 子力价值和位置价值一起计算（优化性能）
    const pieces = board.getAllPieces();
    for (const piece of pieces) {
      const materialValue = piece.getValue();
      const positionValue = PositionTables.getValue(
        piece.type,
        piece.position.x,
        piece.position.y,
        piece.color === Color.RED
      );

      const totalValue = materialValue + positionValue * 0.2;
      score += piece.color === Color.RED ? totalValue : -totalValue;
    }

    return color === Color.RED ? score : -score;
  }
}
