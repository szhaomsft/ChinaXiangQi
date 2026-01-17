import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { GameManager } from '../game/GameManager';
import { Move } from '../core/move/Move';
import { Position } from '../core/board/Position';
import { GameMode, DifficultyLevel, GameStatus, Color } from '../types';
import { Board } from '../core/board/Board';
import { MoveGenerator } from '../core/move/MoveGenerator';

interface GameContextValue {
  board: Board;
  currentPlayer: Color;
  gameMode: GameMode;
  difficulty: DifficultyLevel;
  gameStatus: GameStatus;
  isAIThinking: boolean;
  selectedPosition: Position | null;
  validMoves: Position[];
  lastMove: Move | null;

  makeMove: (move: Move) => Promise<void>;
  selectPosition: (pos: Position) => void;
  undoMove: () => void;
  newGame: (mode: GameMode, difficulty: DifficultyLevel) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameManagerRef = useRef(new GameManager());
  const moveGeneratorRef = useRef(new MoveGenerator());

  const [board, setBoard] = useState(() => gameManagerRef.current.getBoard().clone());
  const [currentPlayer, setCurrentPlayer] = useState(gameManagerRef.current.getCurrentPlayer());
  const [gameMode, setGameMode] = useState(gameManagerRef.current.getGameMode());
  const [difficulty, setDifficulty] = useState(gameManagerRef.current.getDifficulty());
  const [gameStatus, setGameStatus] = useState(gameManagerRef.current.getGameStatus());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  const updateGameState = useCallback(() => {
    setBoard(gameManagerRef.current.getBoard().clone());
    setCurrentPlayer(gameManagerRef.current.getCurrentPlayer());
    setGameStatus(gameManagerRef.current.getGameStatus());
  }, []);

  const triggerAIMove = useCallback(async () => {
    if (gameStatus !== GameStatus.PLAYING) return;

    setIsAIThinking(true);
    try {
      const aiMove = await gameManagerRef.current.requestAIMove();
      setLastMove(aiMove);
      gameManagerRef.current.makeMove(aiMove);
      updateGameState();

      setIsAIThinking(false);

      // AI vs AI模式：等待动画播放完成后再继续
      if (gameMode === GameMode.AI_VS_AI && gameManagerRef.current.getGameStatus() === GameStatus.PLAYING) {
        setTimeout(() => {
          triggerAIMove();
        }, 1200); // 1.2秒延迟，让玩家能看清楚移动
      }
    } catch (e) {
      console.error('AI move error:', e);
      setIsAIThinking(false);
    }
  }, [gameStatus, updateGameState, gameMode]);

  const makeMove = useCallback(async (move: Move) => {
    setLastMove(move);
    gameManagerRef.current.makeMove(move);
    updateGameState();
    setSelectedPosition(null);
    setValidMoves([]);

    // 玩家vs AI模式：如果是AI回合，触发AI移动
    if (gameMode === GameMode.PLAYER_VS_AI && gameManagerRef.current.getCurrentPlayer() === Color.BLACK) {
      setTimeout(() => {
        triggerAIMove();
      }, 500);
    }
  }, [gameMode, updateGameState, triggerAIMove]);

  const selectPosition = useCallback((pos: Position) => {
    const piece = board.getPiece(pos);

    if (selectedPosition === null) {
      // 选择棋子
      if (piece && piece.color === currentPlayer) {
        setSelectedPosition(pos);
        const moves = moveGeneratorRef.current.generateLegalMoves(board, currentPlayer);
        const pieceMoves = moves.filter(m => m.from.equals(pos));
        setValidMoves(pieceMoves.map(m => m.to));
      }
    } else {
      // 尝试移动
      const isValid = validMoves.some(p => p.equals(pos));
      if (isValid) {
        const piece = board.getPiece(selectedPosition)!;
        const capturedPiece = board.getPiece(pos);
        const move = new Move(selectedPosition, pos, piece, capturedPiece);
        makeMove(move);
      } else {
        // 重新选择
        if (piece && piece.color === currentPlayer) {
          // 直接切换到新选择的棋子
          const moves = moveGeneratorRef.current.generateLegalMoves(board, currentPlayer);
          const pieceMoves = moves.filter(m => m.from.equals(pos));
          setSelectedPosition(pos);
          setValidMoves(pieceMoves.map(m => m.to));
        } else {
          // 取消选择
          setSelectedPosition(null);
          setValidMoves([]);
        }
      }
    }
  }, [board, currentPlayer, selectedPosition, validMoves, makeMove]);

  const undoMove = useCallback(() => {
    // 玩家vs AI模式下，悔棋要撤销两步（玩家 + AI）
    if (gameMode === GameMode.PLAYER_VS_AI) {
      gameManagerRef.current.undoMove(); // AI的走法
      gameManagerRef.current.undoMove(); // 玩家的走法
    } else {
      gameManagerRef.current.undoMove();
    }
    updateGameState();
    setSelectedPosition(null);
    setValidMoves([]);
    setLastMove(null);
  }, [gameMode, updateGameState]);

  const newGame = useCallback((mode: GameMode, diff: DifficultyLevel) => {
    gameManagerRef.current.newGame(mode, diff);
    setGameMode(mode);
    setDifficulty(diff);
    updateGameState();
    setSelectedPosition(null);
    setValidMoves([]);
    setLastMove(null);
    setIsAIThinking(false);

    // 如果是AI vs AI，立即开始
    if (mode === GameMode.AI_VS_AI) {
      setTimeout(() => {
        triggerAIMove();
      }, 500);
    }
  }, [updateGameState, triggerAIMove]);

  const value: GameContextValue = {
    board,
    currentPlayer,
    gameMode,
    difficulty,
    gameStatus,
    isAIThinking,
    selectedPosition,
    validMoves,
    lastMove,
    makeMove,
    selectPosition,
    undoMove,
    newGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
