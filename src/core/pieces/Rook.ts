import { Piece } from './Piece';
import { Color, PieceType } from '../../types';
import { Position } from '../board/Position';
import { Board } from '../board/Board';
import { PIECE_VALUES } from '../../utils/constants';

export class Rook extends Piece {
  constructor(color: Color, position: Position) {
    super(color, PieceType.ROOK, position);
  }

  canMoveTo(board: Board, to: Position): boolean {
    if (!to.isValid()) return false;

    const dx = to.x - this.position.x;
    const dy = to.y - this.position.y;

    // 只能直线移动
    if (dx !== 0 && dy !== 0) return false;
    if (dx === 0 && dy === 0) return false;

    // 检查路径上是否有障碍
    const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);

    let currentX = this.position.x + stepX;
    let currentY = this.position.y + stepY;

    while (currentX !== to.x || currentY !== to.y) {
      if (board.getPiece(new Position(currentX, currentY)) !== null) {
        return false;
      }
      currentX += stepX;
      currentY += stepY;
    }

    const target = board.getPiece(to);
    return target === null || target.color !== this.color;
  }

  getValue(): number {
    return PIECE_VALUES.ROOK;
  }

  clone(): Piece {
    return new Rook(this.color, this.position.clone());
  }
}
