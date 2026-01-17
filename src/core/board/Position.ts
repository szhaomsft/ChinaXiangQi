import { BOARD_WIDTH, BOARD_HEIGHT } from '../../utils/constants';

export class Position {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  equals(other: Position): boolean {
    return this.x === other.x && this.y === other.y;
  }

  isValid(): boolean {
    return this.x >= 0 && this.x < BOARD_WIDTH &&
           this.y >= 0 && this.y < BOARD_HEIGHT;
  }

  toString(): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    return `${files[this.x]}${this.y}`;
  }

  clone(): Position {
    return new Position(this.x, this.y);
  }
}
