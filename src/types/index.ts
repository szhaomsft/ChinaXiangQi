export enum Color {
  RED = 'RED',
  BLACK = 'BLACK'
}

export enum PieceType {
  KING = 'KING',      // 将/帅
  ADVISOR = 'ADVISOR', // 士
  ELEPHANT = 'ELEPHANT', // 象
  KNIGHT = 'KNIGHT',  // 马
  ROOK = 'ROOK',      // 车
  CANNON = 'CANNON',  // 炮
  PAWN = 'PAWN'       // 兵/卒
}

export enum GameMode {
  PLAYER_VS_AI = 'PLAYER_VS_AI',
  AI_VS_AI = 'AI_VS_AI'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum GameStatus {
  PLAYING = 'PLAYING',
  RED_WIN = 'RED_WIN',
  BLACK_WIN = 'BLACK_WIN',
  DRAW = 'DRAW'
}

export function oppositeColor(color: Color): Color {
  return color === Color.RED ? Color.BLACK : Color.RED;
}

export function getPieceDisplayName(type: PieceType, color: Color): string {
  const names = {
    [PieceType.KING]: color === Color.RED ? '帅' : '将',
    [PieceType.ADVISOR]: '士',
    [PieceType.ELEPHANT]: color === Color.RED ? '相' : '象',
    [PieceType.KNIGHT]: '马',
    [PieceType.ROOK]: '车',
    [PieceType.CANNON]: '炮',
    [PieceType.PAWN]: color === Color.RED ? '兵' : '卒'
  };
  return names[type];
}
