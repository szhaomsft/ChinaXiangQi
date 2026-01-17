import { Piece } from './Piece';
import { Color, PieceType } from '../../types';
import { Position } from '../board/Position';
import { Board } from '../board/Board';
import { PIECE_VALUES } from '../../utils/constants';

export class Knight extends Piece {
  constructor(color: Color, position: Position) {
    super(color, PieceType.KNIGHT, position);
  }

  canMoveTo(board: Board, to: Position): boolean {
    if (!to.isValid()) return false;

    const dx = to.x - this.position.x;
    const dy = to.y - this.position.y;

    // 马走日字
    if ((Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2)) {
      // 检查蹩马腿
      let legX, legY;
      if (Math.abs(dx) === 2) {
        legX = this.position.x + dx / 2;
        legY = this.position.y;
      } else {
        legX = this.position.x;
        legY = this.position.y + dy / 2;
      }

      if (board.getPiece(new Position(legX, legY)) !== null) {
        return false;
      }

      const target = board.getPiece(to);
      return target === null || target.color !== this.color;
    }

    return false;
  }

  getValue(): number {
    return PIECE_VALUES.KNIGHT;
  }

  clone(): Piece {
    return new Knight(this.color, this.position.clone());
  }
}
