import { Piece } from './Piece';
import { Color, PieceType } from '../../types';
import { Position } from '../board/Position';
import { Board } from '../board/Board';
import { PIECE_VALUES } from '../../utils/constants';

export class King extends Piece {
  constructor(color: Color, position: Position) {
    super(color, PieceType.KING, position);
  }

  canMoveTo(board: Board, to: Position): boolean {
    if (!to.isValid()) return false;

    const dx = Math.abs(to.x - this.position.x);
    const dy = Math.abs(to.y - this.position.y);

    // 只能移动一格
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      // 检查是否在九宫内
      const inPalace = (to.x >= 3 && to.x <= 5) &&
                       (this.color === Color.RED ? (to.y >= 7 && to.y <= 9) : (to.y >= 0 && to.y <= 2));

      if (!inPalace) return false;

      const target = board.getPiece(to);
      return target === null || target.color !== this.color;
    }

    return false;
  }

  getValue(): number {
    return PIECE_VALUES.KING;
  }

  clone(): Piece {
    return new King(this.color, this.position.clone());
  }
}
