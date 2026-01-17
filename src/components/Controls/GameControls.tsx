import React from 'react';
import { useGame } from '../../context/GameContext';
import { GameMode, DifficultyLevel, GameStatus } from '../../types';
import './GameControls.css';

export function GameControls() {
  const { gameMode, difficulty, gameStatus, isAIThinking, newGame, undoMove } = useGame();

  return (
    <div className="game-controls">
      <h2>中国象棋</h2>

      <div className="control-section">
        <h3>游戏模式</h3>
        <button onClick={() => newGame(GameMode.PLAYER_VS_AI, difficulty)}>
          玩家 vs AI
        </button>
        <button onClick={() => newGame(GameMode.AI_VS_AI, difficulty)}>
          AI vs AI
        </button>
      </div>

      <div className="control-section">
        <h3>AI难度</h3>
        <button onClick={() => newGame(gameMode, DifficultyLevel.EASY)}>
          简单
        </button>
        <button onClick={() => newGame(gameMode, DifficultyLevel.MEDIUM)}>
          中等
        </button>
        <button onClick={() => newGame(gameMode, DifficultyLevel.HARD)}>
          困难
        </button>
      </div>

      <div className="control-section">
        <h3>操作</h3>
        <button onClick={() => newGame(gameMode, difficulty)}>
          新游戏
        </button>
        <button
          onClick={undoMove}
          disabled={gameStatus !== GameStatus.PLAYING || isAIThinking}
        >
          悔棋
        </button>
      </div>

      <div className="status-section">
        <h3>游戏状态</h3>
        <p>
          {gameStatus === GameStatus.PLAYING && !isAIThinking && '游戏进行中'}
          {isAIThinking && 'AI思考中...'}
          {gameStatus === GameStatus.RED_WIN && '红方胜!'}
          {gameStatus === GameStatus.BLACK_WIN && '黑方胜!'}
          {gameStatus === GameStatus.DRAW && '和棋!'}
        </p>
        <p>模式: {gameMode === GameMode.PLAYER_VS_AI ? '玩家 vs AI' : 'AI vs AI'}</p>
        <p>难度: {
          difficulty === DifficultyLevel.EASY ? '简单' :
          difficulty === DifficultyLevel.MEDIUM ? '中等' : '困难'
        }</p>
      </div>
    </div>
  );
}
