import { Move } from '../move/Move';

export class GameHistory {
  private moves: Move[] = [];
  private boardHashes: number[] = [];

  addMove(move: Move, boardHash: number): void {
    this.moves.push(move);
    this.boardHashes.push(boardHash);
  }

  undo(): { move: Move | null; hash: number | null } {
    const move = this.moves.pop() || null;
    const hash = this.boardHashes.pop() || null;
    return { move, hash };
  }

  getMoves(): Move[] {
    return [...this.moves];
  }

  getLastMove(): Move | null {
    return this.moves.length > 0 ? this.moves[this.moves.length - 1] : null;
  }

  getBoardHashes(): number[] {
    return [...this.boardHashes];
  }

  clear(): void {
    this.moves = [];
    this.boardHashes = [];
  }
}
