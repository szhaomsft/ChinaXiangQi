import { Board } from '../board/Board';
import { Position } from '../board/Position';
import { Color, oppositeColor } from '../../types';
import { MoveGenerator } from '../move/MoveGenerator';

export class CheckDetector {
  private moveGenerator: MoveGenerator;

  constructor() {
    this.moveGenerator = new MoveGenerator();
  }

  isInCheck(board: Board, color: Color): boolean {
    const kingPos = board.getKingPosition(color);
    if (!kingPos) return false;

    const opponentColor = oppositeColor(color);
    const opponentPieces = board.getPiecesByColor(opponentColor);

    for (const piece of opponentPieces) {
      if (piece.canMoveTo(board, kingPos)) {
        return true;
      }
    }

    // 检查白脸将
    return this.isFlyingKing(board);
  }

  isCheckmate(board: Board, color: Color): boolean {
    if (!this.isInCheck(board, color)) return false;
    const legalMoves = this.moveGenerator.generateLegalMoves(board, color);
    return legalMoves.length === 0;
  }

  isStalemate(board: Board, color: Color): boolean {
    if (this.isInCheck(board, color)) return false;
    const legalMoves = this.moveGenerator.generateLegalMoves(board, color);
    return legalMoves.length === 0;
  }

  isFlyingKing(board: Board): boolean {
    const redKingPos = board.getKingPosition(Color.RED);
    const blackKingPos = board.getKingPosition(Color.BLACK);

    if (!redKingPos || !blackKingPos) return false;

    // 不在同一列
    if (redKingPos.x !== blackKingPos.x) return false;

    // 检查中间是否有棋子
    const minY = Math.min(redKingPos.y, blackKingPos.y);
    const maxY = Math.max(redKingPos.y, blackKingPos.y);

    for (let y = minY + 1; y < maxY; y++) {
      if (board.getPiece(new Position(redKingPos.x, y)) !== null) {
        return false;
      }
    }

    return true;
  }
}
