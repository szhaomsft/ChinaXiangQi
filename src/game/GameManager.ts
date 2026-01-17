import { Board } from '../core/board/Board';
import { Move } from '../core/move/Move';
import { Color, GameMode, DifficultyLevel, GameStatus, oppositeColor } from '../types';
import { MoveGenerator } from '../core/move/MoveGenerator';
import { CheckDetector } from '../core/rules/CheckDetector';
import { DrawDetector } from '../core/rules/DrawDetector';
import { AIEngine } from '../ai/engine/AIEngine';
import { GameHistory } from './GameHistory';

export class GameManager {
  private board: Board;
  private currentPlayer: Color;
  private gameMode: GameMode;
  private difficulty: DifficultyLevel;
  private history: GameHistory;
  private moveGenerator: MoveGenerator;
  private checkDetector: CheckDetector;
  private drawDetector: DrawDetector;
  private aiEngine: AIEngine;
  private _gameStatus: GameStatus;

  constructor() {
    this.board = new Board();
    this.currentPlayer = Color.RED;
    this.gameMode = GameMode.PLAYER_VS_AI;
    this.difficulty = DifficultyLevel.MEDIUM;
    this.history = new GameHistory();
    this.moveGenerator = new MoveGenerator();
    this.checkDetector = new CheckDetector();
    this.drawDetector = new DrawDetector();
    this.aiEngine = new AIEngine();
    this._gameStatus = GameStatus.PLAYING;

    this.board.initializeBoard();
  }

  getBoard(): Board {
    return this.board;
  }

  getCurrentPlayer(): Color {
    return this.currentPlayer;
  }

  getGameStatus(): GameStatus {
    return this._gameStatus;
  }

  getGameMode(): GameMode {
    return this.gameMode;
  }

  getDifficulty(): DifficultyLevel {
    return this.difficulty;
  }

  getHistory(): GameHistory {
    return this.history;
  }

  makeMove(move: Move): boolean {
    if (this._gameStatus !== GameStatus.PLAYING) return false;

    // 执行移动
    this.moveGenerator.makeMove(this.board, move);
    this.history.addMove(move, this.board.getHash());

    // 切换玩家
    this.currentPlayer = oppositeColor(this.currentPlayer);

    // 检查游戏状态
    this._gameStatus = this.checkGameStatus();

    return true;
  }

  async requestAIMove(): Promise<Move> {
    const move = await this.aiEngine.findBestMove(
      this.board,
      this.currentPlayer,
      this.difficulty
    );
    return move;
  }

  undoMove(): boolean {
    const { move, hash } = this.history.undo();
    if (!move) return false;

    // 悔棋操作
    this.moveGenerator.undoMove(this.board, move);
    // 注意：undoMove通过setPiece自动更新了哈希值，
    // 但我们需要验证它是否与历史记录中的上一个哈希值一致
    // 如果历史记录中还有记录，取最后一个哈希
    const hashes = this.history.getBoardHashes();
    if (hashes.length > 0) {
      this.board.setHash(hashes[hashes.length - 1]);
    } else {
      // 如果没有历史记录了，重新计算哈希
      this.board.setHash(this.board.calculateHash());
    }

    this.currentPlayer = oppositeColor(this.currentPlayer);
    this._gameStatus = GameStatus.PLAYING;

    return true;
  }

  newGame(mode: GameMode, difficulty: DifficultyLevel): void {
    this.board = new Board();
    this.board.initializeBoard();
    this.currentPlayer = Color.RED;
    this.gameMode = mode;
    this.difficulty = difficulty;
    this.history.clear();
    this._gameStatus = GameStatus.PLAYING;
  }

  private checkGameStatus(): GameStatus {
    // 检查将死
    if (this.checkDetector.isCheckmate(this.board, this.currentPlayer)) {
      return this.currentPlayer === Color.RED ? GameStatus.BLACK_WIN : GameStatus.RED_WIN;
    }

    // 检查困毙
    if (this.checkDetector.isStalemate(this.board, this.currentPlayer)) {
      return GameStatus.DRAW;
    }

    // 检查和棋
    if (this.drawDetector.isDraw(this.history)) {
      return GameStatus.DRAW;
    }

    return GameStatus.PLAYING;
  }

  isPlayerTurn(): boolean {
    if (this.gameMode === GameMode.AI_VS_AI) return false;
    return this.currentPlayer === Color.RED;
  }
}
