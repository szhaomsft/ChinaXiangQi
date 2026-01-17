import { Move } from '../../core/move/Move';

export enum TTEntryType {
  EXACT = 'EXACT',
  LOWER_BOUND = 'LOWER_BOUND',
  UPPER_BOUND = 'UPPER_BOUND'
}

export interface TTEntry {
  hash: number;
  depth: number;
  score: number;
  type: TTEntryType;
  bestMove: Move | null;
}

export class TranspositionTable {
  private table: Map<number, TTEntry>;
  private maxSize: number;

  constructor(maxSize: number = 1000000) {
    this.table = new Map();
    this.maxSize = maxSize;
  }

  store(hash: number, depth: number, score: number, type: TTEntryType, bestMove: Move | null = null): void {
    // 如果表太大，清除一半
    if (this.table.size >= this.maxSize) {
      this.clear();
    }

    const entry = this.table.get(hash);

    // 只存储更深的搜索结果
    if (!entry || depth >= entry.depth) {
      this.table.set(hash, { hash, depth, score, type, bestMove });
    }
  }

  probe(hash: number, depth: number, alpha: number, beta: number): number | null {
    const entry = this.table.get(hash);

    if (!entry || entry.depth < depth) {
      return null;
    }

    switch (entry.type) {
      case TTEntryType.EXACT:
        return entry.score;
      case TTEntryType.LOWER_BOUND:
        if (entry.score >= beta) {
          return entry.score;
        }
        break;
      case TTEntryType.UPPER_BOUND:
        if (entry.score <= alpha) {
          return entry.score;
        }
        break;
    }

    return null;
  }

  getBestMove(hash: number): Move | null {
    const entry = this.table.get(hash);
    return entry?.bestMove || null;
  }

  clear(): void {
    this.table.clear();
  }

  size(): number {
    return this.table.size;
  }
}
