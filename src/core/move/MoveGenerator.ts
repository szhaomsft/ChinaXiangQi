import { Board } from '../board/Board';
import { Move } from './Move';
import { Position } from '../board/Position';
import { Color } from '../../types';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../utils/constants';

export class MoveGenerator {
  generateLegalMoves(board: Board, color: Color): Move[] {
    const moves: Move[] = [];
    const pieces = board.getPiecesByColor(color);

    for (const piece of pieces) {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          const to = new Position(x, y);
          if (piece.canMoveTo(board, to)) {
            const capturedPiece = board.getPiece(to);
            const move = new Move(piece.position, to, piece, capturedPiece);

            // 验证移动后不会被将军
            if (this.isLegalMove(board, move)) {
              moves.push(move);
            }
          }
        }
      }
    }

    return moves;
  }

  generateCaptureMoves(board: Board, color: Color): Move[] {
    return this.generateLegalMoves(board, color).filter(m => m.capturedPiece !== null);
  }

  private isLegalMove(board: Board, move: Move): boolean {
    // 临时执行移动
    const testBoard = board.clone();
    this.makeMove(testBoard, move);

    // 检查是否被将军
    const kingPos = testBoard.getKingPosition(move.piece.color);
    if (!kingPos) return false;

    return !this.isPositionUnderAttack(testBoard, kingPos, move.piece.color);
  }

  private isPositionUnderAttack(board: Board, pos: Position, color: Color): boolean {
    const opponentColor = color === Color.RED ? Color.BLACK : Color.RED;
    const opponentPieces = board.getPiecesByColor(opponentColor);

    for (const piece of opponentPieces) {
      if (piece.canMoveTo(board, pos)) {
        return true;
      }
    }

    return false;
  }

  makeMove(board: Board, move: Move): void {
    board.setPiece(move.from, null);
    const newPiece = move.piece.clone();
    newPiece.setPosition(move.to);
    board.setPiece(move.to, newPiece);
  }

  undoMove(board: Board, move: Move): void {
    const piece = board.getPiece(move.to);
    if (piece) {
      piece.setPosition(move.from);
      board.setPiece(move.from, piece);
    }
    board.setPiece(move.to, move.capturedPiece);
  }
}
