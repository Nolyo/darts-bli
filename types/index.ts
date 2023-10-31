export type PlayerType = {
    id: number,
    name: string,
    score: number,
    order: number,
}

export type GameType = {id: string, players: PlayerType[], type: string, rows: any[], ranking: PlayerType[]}

export type DartsType = {score: number, multiplier: number}