import { GameHistory } from '../game/GameHistory';

export class DrawDetector {
  isDraw(history: GameHistory): boolean {
    return this.isDrawByMoveCount(history) || this.isDrawByRepetition(history);
  }

  isDrawByMoveCount(history: GameHistory): boolean {
    const moves = history.getMoves();
    let movesSinceCapture = 0;

    for (let i = moves.length - 1; i >= 0; i--) {
      if (moves[i].capturedPiece) break;
      movesSinceCapture++;
    }

    return movesSinceCapture >= 120;
  }

  isDrawByRepetition(history: GameHistory): boolean {
    const hashes = history.getBoardHashes();
    if (hashes.length === 0) return false;

    const currentHash = hashes[hashes.length - 1];
    let repetitionCount = 0;

    for (const hash of hashes) {
      if (hash === currentHash) {
        repetitionCount++;
      }
    }

    return repetitionCount >= 3;
  }
}
