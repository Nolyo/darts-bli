import Player from "./player";
import {DartsType} from "../types";

/*
* PlayerInRow représente le passage d'un joueur dans un tour de jeu
* Un PlayerInRow contient un joueur, son score et ses darts
* Un row contient plusieurs PlayerInRow
* La game contiendra un array de row
* Grace au rows on peut savoir a quel tour de jeu on est
* Grace au PlayerInRow on peut savoir quel joueur a joué et quel score il a fait
* */
export default class PlayerInRow {
    player: Player;
    score: number;
    darts: DartsType[];

    constructor(player: Player, score: number, darts: DartsType[]) {
        this.player = player;
        this.score = score;
        this.darts = darts;
    }

    addDart(dart: DartsType) {
        if (this.darts.length === 3) {
            throw new Error('Trop de fléchettes jouées');
        }

        this.darts.push(dart);
    }

    removerLastDart() {
        const dart = this.darts.pop();
        if (!dart) {
            throw new Error('No dart found');
        }

        return dart;
    }

    getScore() {
        return this.score;
    }

    setScore(score: number) {
        this.score = score;
    }

    getDartsCount() {
        return this.darts.length;
    }

    getDarts() {
        return this.darts;
    }

    getPlayer() {
        return this.player;
    }

    hydrate(data: any) {
        this.player = new Player(data.player.id);
        this.player.hydrate(data.player);
        this.score = data.score;
        this.darts = data.darts;
    }
}
