import { Piece } from '../pieces/Piece';
import { Position } from '../board/Position';
import { Color, oppositeColor, getPieceDisplayName } from '../../types';

export class Move {
  constructor(
    public readonly from: Position,
    public readonly to: Position,
    public readonly piece: Piece,
    public readonly capturedPiece: Piece | null = null
  ) {}

  toString(): string {
    const pieceName = getPieceDisplayName(this.piece.type, this.piece.color);
    return `${pieceName} ${this.from.toString()} -> ${this.to.toString()}`;
  }

  toUCCI(): string {
    return `${this.from.toString()}${this.to.toString()}`;
  }
}
