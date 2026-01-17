// AI Worker - 在后台线程执行AI计算
import { Board } from '../../core/board/Board';
import { Color, DifficultyLevel } from '../../types';
import { AIEngine } from '../engine/AIEngine';

const aiEngine = new AIEngine();

// 监听主线程消息
self.onmessage = async (e: MessageEvent) => {
  const { type, boardData, color, difficulty } = e.data;

  if (type === 'FIND_BEST_MOVE') {
    try {
      // 重建Board对象
      const board = reconstructBoard(boardData);

      // 执行AI搜索
      const bestMove = await aiEngine.findBestMove(board, color, difficulty);

      // 返回结果
      self.postMessage({
        type: 'BEST_MOVE_FOUND',
        move: {
          from: { x: bestMove.from.x, y: bestMove.from.y },
          to: { x: bestMove.to.x, y: bestMove.to.y },
          piece: {
            type: bestMove.piece.type,
            color: bestMove.piece.color,
            position: { x: bestMove.piece.position.x, y: bestMove.piece.position.y }
          },
          capturedPiece: bestMove.capturedPiece ? {
            type: bestMove.capturedPiece.type,
            color: bestMove.capturedPiece.color,
            position: { x: bestMove.capturedPiece.position.x, y: bestMove.capturedPiece.position.y }
          } : null
        }
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// 从序列化数据重建Board对象
function reconstructBoard(boardData: any): Board {
  const board = new Board();

  // 重建棋盘状态
  for (const pieceData of boardData.pieces) {
    const { type, color, position } = pieceData;
    const piece = createPiece(type, color, position);
    board.setPiece(piece.position, piece);
  }

  // 恢复哈希值
  board.setHash(boardData.hash);

  return board;
}

// 根据类型创建棋子
function createPiece(type: string, color: Color, position: { x: number, y: number }): any {
  const { Position } = require('../../core/board/Position');
  const pos = new Position(position.x, position.y);

  switch (type) {
    case 'ROOK':
      const { Rook } = require('../../core/pieces/Rook');
      return new Rook(color, pos);
    case 'KNIGHT':
      const { Knight } = require('../../core/pieces/Knight');
      return new Knight(color, pos);
    case 'CANNON':
      const { Cannon } = require('../../core/pieces/Cannon');
      return new Cannon(color, pos);
    case 'ELEPHANT':
      const { Elephant } = require('../../core/pieces/Elephant');
      return new Elephant(color, pos);
    case 'ADVISOR':
      const { Advisor } = require('../../core/pieces/Advisor');
      return new Advisor(color, pos);
    case 'KING':
      const { King } = require('../../core/pieces/King');
      return new King(color, pos);
    case 'PAWN':
      const { Pawn } = require('../../core/pieces/Pawn');
      return new Pawn(color, pos);
    default:
      throw new Error(`Unknown piece type: ${type}`);
  }
}

export {};
