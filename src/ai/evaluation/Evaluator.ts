import { Board } from '../../core/board/Board';
import { Color } from '../../types';
import { Piece } from '../../core/pieces/Piece';

export class Evaluator {
  evaluate(board: Board, color: Color): number {
    let score = 0;

    // 子力价值评估
    const pieces = board.getAllPieces();
    for (const piece of pieces) {
      const value = piece.getValue();
      score += piece.color === Color.RED ? value : -value;
    }

    // 灵活性评估（走法数量）
    // 省略以提高速度

    return color === Color.RED ? score : -score;
  }
}
