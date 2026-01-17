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

  makeMove: (move: Move) => Promise<void>;
  selectPosition: (pos: Position) => void;
  undoMove: () => void;
  newGame: (mode: GameMode, difficulty: DifficultyLevel) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameManagerRef = useRef(new GameManager());
  const moveGeneratorRef = useRef(new MoveGenerator());

  const [board, setBoard] = useState(gameManagerRef.current.getBoard());
  const [currentPlayer, setCurrentPlayer] = useState(gameManagerRef.current.getCurrentPlayer());
  const [gameMode, setGameMode] = useState(gameManagerRef.current.getGameMode());
  const [difficulty, setDifficulty] = useState(gameManagerRef.current.getDifficulty());
  const [gameStatus, setGameStatus] = useState(gameManagerRef.current.getGameStatus());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

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
      gameManagerRef.current.makeMove(aiMove);
      updateGameState();
    } catch (e) {
      console.error('AI move error:', e);
    } finally {
      setIsAIThinking(false);
    }
  }, [gameStatus, updateGameState]);

  const makeMove = useCallback(async (move: Move) => {
    gameManagerRef.current.makeMove(move);
    updateGameState();
    setSelectedPosition(null);
    setValidMoves([]);

    // 如果是AI回合，触发AI移动
    if (gameMode === GameMode.PLAYER_VS_AI && gameManagerRef.current.getCurrentPlayer() === Color.BLACK) {
      setTimeout(() => {
        triggerAIMove();
      }, 500);
    } else if (gameMode === GameMode.AI_VS_AI) {
      setTimeout(() => {
        triggerAIMove();
      }, 1000);
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
        setSelectedPosition(null);
        setValidMoves([]);
        if (piece && piece.color === currentPlayer) {
          selectPosition(pos);
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
  }, [gameMode, updateGameState]);

  const newGame = useCallback((mode: GameMode, diff: DifficultyLevel) => {
    gameManagerRef.current.newGame(mode, diff);
    setGameMode(mode);
    setDifficulty(diff);
    updateGameState();
    setSelectedPosition(null);
    setValidMoves([]);
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
