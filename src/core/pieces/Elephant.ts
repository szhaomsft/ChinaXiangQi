import { Piece } from './Piece';
import { Color, PieceType } from '../../types';
import { Position } from '../board/Position';
import { Board } from '../board/Board';
import { PIECE_VALUES } from '../../utils/constants';

export class Elephant extends Piece {
  constructor(color: Color, position: Position) {
    super(color, PieceType.ELEPHANT, position);
  }

  canMoveTo(board: Board, to: Position): boolean {
    if (!to.isValid()) return false;

    const dx = to.x - this.position.x;
    const dy = to.y - this.position.y;

    // 必须走田字
    if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
      // 不能过河
      if (this.color === Color.RED && to.y < 5) return false;
      if (this.color === Color.BLACK && to.y > 4) return false;

      // 检查塞象眼
      const midX = this.position.x + dx / 2;
      const midY = this.position.y + dy / 2;
      if (board.getPiece(new Position(midX, midY)) !== null) {
        return false;
      }

      const target = board.getPiece(to);
      return target === null || target.color !== this.color;
    }

    return false;
  }

  getValue(): number {
    return PIECE_VALUES.ELEPHANT;
  }

  clone(): Piece {
    return new Elephant(this.color, this.position.clone());
  }
}
