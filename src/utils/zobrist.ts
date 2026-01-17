import { Color, PieceType } from '../types';
import { BOARD_WIDTH, BOARD_HEIGHT } from './constants';

/**
 * Zobrist哈希算法
 * 为每个位置的每种棋子生成唯一的随机数
 * 用于快速比较两个棋盘是否相同
 */
class ZobristHashGenerator {
  private static table: number[][][] | null = null;

  // 生成随机数表
  private static initializeTable(): void {
    if (this.table) return;

    // 创建 9 × 10 × 14 的三维数组
    // 9列 × 10行 × 14种棋子（7种×2色）
    this.table = [];

    for (let x = 0; x < BOARD_WIDTH; x++) {
      this.table[x] = [];
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        this.table[x][y] = [];
        for (let i = 0; i < 14; i++) {
          // 生成32位随机数
          this.table[x][y][i] = this.randomInt32();
        }
      }
    }
  }

  // 生成32位随机整数
  private static randomInt32(): number {
    return Math.floor(Math.random() * 0x100000000);
  }

  // 获取棋子索引 (0-13)
  private static getPieceIndex(type: PieceType, color: Color): number {
    const typeIndex = {
      [PieceType.KING]: 0,
      [PieceType.ADVISOR]: 1,
      [PieceType.ELEPHANT]: 2,
      [PieceType.KNIGHT]: 3,
      [PieceType.ROOK]: 4,
      [PieceType.CANNON]: 5,
      [PieceType.PAWN]: 6
    }[type];

    return color === Color.RED ? typeIndex : typeIndex + 7;
  }

  // 获取指定位置和棋子的哈希值
  static getHash(x: number, y: number, type: PieceType, color: Color): number {
    if (!this.table) {
      this.initializeTable();
    }

    const pieceIndex = this.getPieceIndex(type, color);
    return this.table![x][y][pieceIndex];
  }
}

export { ZobristHashGenerator };
