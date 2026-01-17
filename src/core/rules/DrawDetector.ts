import { GameHistory } from '../../game/GameHistory';

export class DrawDetector {
  isDraw(history: GameHistory): boolean {
    const byMoveCount = this.isDrawByMoveCount(history);
    const byRepetition = this.isDrawByRepetition(history);

    if (byMoveCount || byRepetition) {
      console.log('🔴 和棋检测:', {
        byMoveCount,
        byRepetition,
        totalMoves: history.getMoves().length,
        totalHashes: history.getBoardHashes().length
      });
    }

    return byMoveCount || byRepetition;
  }

  isDrawByMoveCount(history: GameHistory): boolean {
    const moves = history.getMoves();
    let movesSinceCapture = 0;

    for (let i = moves.length - 1; i >= 0; i--) {
      if (moves[i].capturedPiece) break;
      movesSinceCapture++;
    }

    const isDraw = movesSinceCapture >= 120;
    if (isDraw) {
      console.log('📊 60回合无吃子判和:', { movesSinceCapture });
    }

    return isDraw;
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

    const isDraw = repetitionCount >= 3;

    if (isDraw) {
      console.log('🔁 三次重复局面判和:', {
        currentHash,
        repetitionCount,
        allHashes: hashes,
        uniqueHashes: new Set(hashes).size
      });
    }

    return isDraw;
  }
}
