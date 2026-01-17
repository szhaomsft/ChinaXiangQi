import { Color, PieceType } from '../../types';
import { Position } from '../board/Position';
import { Board } from '../board/Board';

export abstract class Piece {
  constructor(
    public color: Color,
    public type: PieceType,
    public position: Position
  ) {}

  abstract canMoveTo(board: Board, to: Position): boolean;
  abstract getValue(): number;
  abstract clone(): Piece;

  setPosition(pos: Position): void {
    (this as { position: Position }).position = pos;
  }
}
