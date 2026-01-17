import React from 'react';
import { useGame } from '../../context/GameContext';
import { Position } from '../../core/board/Position';
import { getPieceDisplayName } from '../../types';
import './BoardComponent.css';

export function BoardComponent() {
  const { board, selectPosition, selectedPosition, validMoves, gameStatus, isAIThinking } = useGame();

  const handleIntersectionClick = (x: number, y: number) => {
    if (isAIThinking) return;
    if (gameStatus !== 'PLAYING') return;
    selectPosition(new Position(x, y));
  };

  const isSelected = (x: number, y: number) => {
    return selectedPosition?.x === x && selectedPosition?.y === y;
  };

  const isValidMove = (x: number, y: number) => {
    return validMoves.some(p => p.x === x && p.y === y);
  };

  // 计算交叉点位置 (x: 0-8, y: 0-9)
  const getIntersectionPosition = (x: number, y: number) => {
    return {
      left: x * 70,
      top: y * 70
    };
  };

  return (
    <div className="board-container">
      <div className="board">
        <div className="board-grid">
          {/* 绘制横线 (10条) */}
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={`h-${i}`}
              className="horizontal-line"
              style={{ top: `${i * 70}px` }}
            />
          ))}

          {/* 绘制竖线 (9条) */}
          {Array.from({ length: 9 }, (_, i) => {
            // 两端的竖线（0和8）是全长的
            if (i === 0 || i === 8) {
              return (
                <div
                  key={`v-${i}`}
                  className="vertical-line full"
                  style={{ left: `${i * 70}px` }}
                />
              );
            }
            // 中间的竖线在楚河汉界处断开
            return (
              <React.Fragment key={`v-${i}`}>
                <div
                  className="vertical-line split-top"
                  style={{ left: `${i * 70}px` }}
                />
                <div
                  className="vertical-line split-bottom"
                  style={{ left: `${i * 70}px` }}
                />
              </React.Fragment>
            );
          })}

          {/* 九宫格米字格斜线 - 黑方（顶部） */}
          <div className="palace-line black-diagonal-1" />
          <div className="palace-line black-diagonal-2" />

          {/* 九宫格米字格斜线 - 红方（底部） */}
          <div className="palace-line red-diagonal-1" />
          <div className="palace-line red-diagonal-2" />

          {/* 楚河汉界文字 */}
          <div className="river-label chu">楚河</div>
          <div className="river-label han">汉界</div>

          {/* 绘制所有交叉点 */}
          {Array.from({ length: 10 }, (_, y) =>
            Array.from({ length: 9 }, (_, x) => {
              const pos = getIntersectionPosition(x, y);
              const piece = board.getPiece(new Position(x, y));
              const selected = isSelected(x, y);
              const valid = isValidMove(x, y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={`intersection ${selected ? 'selected' : ''} ${valid ? 'valid-move' : ''}`}
                  style={{
                    left: `${pos.left}px`,
                    top: `${pos.top}px`
                  }}
                  onClick={() => handleIntersectionClick(x, y)}
                >
                  {piece && (
                    <div className={`piece ${piece.color.toLowerCase()}`}>
                      {getPieceDisplayName(piece.type, piece.color)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
