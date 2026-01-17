import { Piece } from './Piece';
import { Color, PieceType } from '../../types';
import { Position } from '../board/Position';
import { Board } from '../board/Board';
import { PIECE_VALUES } from '../../utils/constants';

export class Cannon extends Piece {
  constructor(color: Color, position: Position) {
    super(color, PieceType.CANNON, position);
  }

  canMoveTo(board: Board, to: Position): boolean {
    if (!to.isValid()) return false;

    const dx = to.x - this.position.x;
    const dy = to.y - this.position.y;

    // 只能直线移动
    if (dx !== 0 && dy !== 0) return false;
    if (dx === 0 && dy === 0) return false;

    // 计算路径上的棋子数
    const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);

    let currentX = this.position.x + stepX;
    let currentY = this.position.y + stepY;
    let piecesInBetween = 0;

    while (currentX !== to.x || currentY !== to.y) {
      if (board.getPiece(new Position(currentX, currentY)) !== null) {
        piecesInBetween++;
      }
      currentX += stepX;
      currentY += stepY;
    }

    const target = board.getPiece(to);

    // 不吃子时，路径必须为空
    if (target === null) {
      return piecesInBetween === 0;
    }

    // 吃子时，必须隔一个子
    if (target.color !== this.color) {
      return piecesInBetween === 1;
    }

    return false;
  }

  getValue(): number {
    return PIECE_VALUES.CANNON;
  }

  clone(): Piece {
    return new Cannon(this.color, this.position.clone());
  }
}
