import { Piece } from '../pieces/Piece';
import { Position } from './Position';
import { Color, PieceType } from '../../types';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../utils/constants';
import { ZobristHashGenerator } from '../../utils/zobrist';
import { Rook } from '../pieces/Rook';
import { Knight } from '../pieces/Knight';
import { Cannon } from '../pieces/Cannon';
import { Elephant } from '../pieces/Elephant';
import { Advisor } from '../pieces/Advisor';
import { King } from '../pieces/King';
import { Pawn } from '../pieces/Pawn';

type BoardArray = (Piece | null)[][];

export class Board {
  private pieces: BoardArray;
  private redKingPos: Position | null = null;
  private blackKingPos: Position | null = null;
  private _hash: number = 0;

  constructor() {
    this.pieces = Array(BOARD_HEIGHT).fill(null).map(() =>
      Array(BOARD_WIDTH).fill(null)
    );
  }

  getPiece(pos: Position): Piece | null {
    if (!pos.isValid()) return null;
    return this.pieces[pos.y][pos.x];
  }

  setPiece(pos: Position, piece: Piece | null): void {
    if (!pos.isValid()) return;

    // 移除旧棋子的哈希贡献
    const oldPiece = this.pieces[pos.y][pos.x];
    if (oldPiece) {
      this._hash ^= ZobristHashGenerator.getHash(pos.x, pos.y, oldPiece.type, oldPiece.color);
    }

    // 设置新棋子
    this.pieces[pos.y][pos.x] = piece;

    // 添加新棋子的哈希贡献
    if (piece) {
      this._hash ^= ZobristHashGenerator.getHash(pos.x, pos.y, piece.type, piece.color);

      // 更新将帅位置
      if (piece.type === PieceType.KING) {
        if (piece.color === Color.RED) {
          this.redKingPos = pos;
        } else {
          this.blackKingPos = pos;
        }
      }
    } else {
      // 如果移除的是将帅，清空位置
      if (oldPiece && oldPiece.type === PieceType.KING) {
        if (oldPiece.color === Color.RED) {
          this.redKingPos = null;
        } else {
          this.blackKingPos = null;
        }
      }
    }
  }

  getKingPosition(color: Color): Position | null {
    return color === Color.RED ? this.redKingPos : this.blackKingPos;
  }

  getAllPieces(): Piece[] {
    const pieces: Piece[] = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const piece = this.pieces[y][x];
        if (piece) {
          pieces.push(piece);
        }
      }
    }
    return pieces;
  }

  getPiecesByColor(color: Color): Piece[] {
    return this.getAllPieces().filter(p => p.color === color);
  }

  clone(): Board {
    const newBoard = new Board();
    // 先重置哈希值，setPiece会自动计算
    newBoard._hash = 0;

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const piece = this.pieces[y][x];
        if (piece) {
          const newPiece = piece.clone();
          newBoard.setPiece(new Position(x, y), newPiece);
        }
      }
    }

    return newBoard;
  }

  getHash(): number {
    return this._hash;
  }

  setHash(hash: number): void {
    this._hash = hash;
  }

  // 计算整个棋盘的哈希值（用于验证）
  calculateHash(): number {
    let hash = 0;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const piece = this.pieces[y][x];
        if (piece) {
          hash ^= ZobristHashGenerator.getHash(x, y, piece.type, piece.color);
        }
      }
    }
    return hash;
  }

  initializeBoard(): void {
    // 黑方（上方）
    this.setPiece(new Position(0, 0), new Rook(Color.BLACK, new Position(0, 0)));
    this.setPiece(new Position(1, 0), new Knight(Color.BLACK, new Position(1, 0)));
    this.setPiece(new Position(2, 0), new Elephant(Color.BLACK, new Position(2, 0)));
    this.setPiece(new Position(3, 0), new Advisor(Color.BLACK, new Position(3, 0)));
    this.setPiece(new Position(4, 0), new King(Color.BLACK, new Position(4, 0)));
    this.setPiece(new Position(5, 0), new Advisor(Color.BLACK, new Position(5, 0)));
    this.setPiece(new Position(6, 0), new Elephant(Color.BLACK, new Position(6, 0)));
    this.setPiece(new Position(7, 0), new Knight(Color.BLACK, new Position(7, 0)));
    this.setPiece(new Position(8, 0), new Rook(Color.BLACK, new Position(8, 0)));

    this.setPiece(new Position(1, 2), new Cannon(Color.BLACK, new Position(1, 2)));
    this.setPiece(new Position(7, 2), new Cannon(Color.BLACK, new Position(7, 2)));

    for (let x = 0; x < BOARD_WIDTH; x += 2) {
      this.setPiece(new Position(x, 3), new Pawn(Color.BLACK, new Position(x, 3)));
    }

    // 红方（下方）
    this.setPiece(new Position(0, 9), new Rook(Color.RED, new Position(0, 9)));
    this.setPiece(new Position(1, 9), new Knight(Color.RED, new Position(1, 9)));
    this.setPiece(new Position(2, 9), new Elephant(Color.RED, new Position(2, 9)));
    this.setPiece(new Position(3, 9), new Advisor(Color.RED, new Position(3, 9)));
    this.setPiece(new Position(4, 9), new King(Color.RED, new Position(4, 9)));
    this.setPiece(new Position(5, 9), new Advisor(Color.RED, new Position(5, 9)));
    this.setPiece(new Position(6, 9), new Elephant(Color.RED, new Position(6, 9)));
    this.setPiece(new Position(7, 9), new Knight(Color.RED, new Position(7, 9)));
    this.setPiece(new Position(8, 9), new Rook(Color.RED, new Position(8, 9)));

    this.setPiece(new Position(1, 7), new Cannon(Color.RED, new Position(1, 7)));
    this.setPiece(new Position(7, 7), new Cannon(Color.RED, new Position(7, 7)));

    for (let x = 0; x < BOARD_WIDTH; x += 2) {
      this.setPiece(new Position(x, 6), new Pawn(Color.RED, new Position(x, 6)));
    }
  }
}
