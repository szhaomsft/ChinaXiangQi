import { Piece } from './Piece';
import { Color, PieceType } from '../../types';
import { Position } from '../board/Position';
import { Board } from '../board/Board';
import { PIECE_VALUES } from '../../utils/constants';

export class Pawn extends Piece {
  constructor(color: Color, position: Position) {
    super(color, PieceType.PAWN, position);
  }

  hasCrossedRiver(): boolean {
    if (this.color === Color.RED) {
      return this.position.y < 5;
    } else {
      return this.position.y > 4;
    }
  }

  canMoveTo(board: Board, to: Position): boolean {
    if (!to.isValid()) return false;

    const dx = to.x - this.position.x;
    const dy = to.y - this.position.y;

    // 兵只能前进或横移（过河后）
    const crossed = this.hasCrossedRiver();

    if (this.color === Color.RED) {
      // 红兵向上走
      if (dy === -1 && dx === 0) {
        // 前进
        const target = board.getPiece(to);
        return target === null || target.color !== this.color;
      } else if (crossed && dy === 0 && Math.abs(dx) === 1) {
        // 过河后可以横移
        const target = board.getPiece(to);
        return target === null || target.color !== this.color;
      }
    } else {
      // 黑兵向下走
      if (dy === 1 && dx === 0) {
        // 前进
        const target = board.getPiece(to);
        return target === null || target.color !== this.color;
      } else if (crossed && dy === 0 && Math.abs(dx) === 1) {
        // 过河后可以横移
        const target = board.getPiece(to);
        return target === null || target.color !== this.color;
      }
    }

    return false;
  }

  getValue(): number {
    return this.hasCrossedRiver() ? 200 : PIECE_VALUES.PAWN;
  }

  clone(): Piece {
    return new Pawn(this.color, this.position.clone());
  }
}
