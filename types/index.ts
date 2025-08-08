export interface PlayerType {
  id: number;
  name: string;
  score: number;
  order: number;
}

export interface DartsType {
  score: number;
  multiplier: number;
}

export interface PlayerInRowType {
  player: PlayerType;
  score: number;
  darts: DartsType[];
}

export interface GameType {
  id: string;
  type: string;
  status: 'pending' | 'started' | 'finished';
  players: PlayerType[];
  rows: PlayerInRowType[][];
  ranking: PlayerType[];
  finishType: 'classic' | 'double';
  isFinishAtFirst: boolean;
}

export type GameStatusType = 'pending' | 'started' | 'finished';
export type FinishType = 'classic' | 'double';
export type GameModeType = '501' | '301' | 'Capital';

// Navigation types
export interface GameParams {
  id: string;
}