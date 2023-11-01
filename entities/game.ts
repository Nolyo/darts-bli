import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './player';
import PlayerInRow from "./playerInRow";
import {DartsType} from "../types";
import DefaultDarts from "../constants/DefaultDarts";

export default class Game {
    id: string;
    type: string;
    status: string;
    players: Player[];
    rows: PlayerInRow[][];
    ranking: Player[];
    finishType: 'classic' | 'double';
    isFinishAtFirst: boolean;

    constructor(
        id?: string | undefined,
        type = '501',
        status = 'pending',
        players: Player[] = [],
        rows: PlayerInRow[][] = [],
        ranking: Player[] = [],
        finishType: 'classic' | 'double' = 'classic',
        isFinishAtFirst = false,
    ) {
        this.id = id || this.generateId();
        this.type = type;
        this.status = status;
        this.players = players;
        this.rows = rows;
        this.ranking = ranking;
        this.finishType = finishType;
        this.isFinishAtFirst = isFinishAtFirst;
    }

    generateId(length: number = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return `darts${result}`
    }

    getPlayers() {
        return this.players;
    }

    currentPlayer() {
        return this.players.find((player) => {
            return this?.getCurrentPlayerInRow()?.player?.id === player.id;
        });
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    getPlayerById(id: number) {
        return this.players.find((p) => p.id === id);
    }

    getNextPlayerId() {
        return this.players.length + 1;
    }

    setType(type: string) {
        this.type = type;
    }

    setTypesFinish(type: 'classic' | 'double') {
        this.finishType = type;
    }

    setFinishAtFirst(isFinishAtFirst: boolean) {
        this.isFinishAtFirst = isFinishAtFirst;
    }

    getRows() {
        return this.rows;
    }

    getCurrentRow() {
        return this.rows[this.rows.length - 1];
    }

    getCurrentPlayerInRow() {
        return this.getCurrentRow()[this.getCurrentRow().length - 1];
    }

    hydrate(data: any) {
        this.id = data.id;
        this.type = data.type;
        this.status = data.status;
        this.finishType = data.finishType;
        this.isFinishAtFirst = data.isFinishAtFirst;
        this.players = data.players.map((player: any) => {
            const newPlayer = new Player(player.id);
            newPlayer.hydrate(player);
            return newPlayer;
        });
        this.rows = data.rows.map((row: any) => {
            return row.map((playerInRow: any) => {
                const _player = new Player(playerInRow.player.id);
                _player.hydrate(playerInRow.player);
                return new PlayerInRow(_player, playerInRow.score, playerInRow.darts)
            });
        });
        this.ranking = data.ranking.map((player: any) => {
            const newPlayer = new Player(player.id);
            newPlayer.hydrate(player);
            return newPlayer;
        });
    }

    getNextPlayerToPlay() {
        if (this.rows.length === 0) {
            return this.players.find((player) => player.order === 1);
        } else {
            const lastPlayerInRow = this.getCurrentPlayerInRow();
            const lastPlayer = lastPlayerInRow.player;
            const lastPlayerOrder = lastPlayer.order;

            if (lastPlayerOrder === this.players.length) {
                return this.players.find((player) => player.order === 1);
            }

            return this.players.find((player) => player.score > 0 && player.order === lastPlayerOrder + 1);
        }
    }

    getPlayerOrderByScore() {
        return this.players.sort((a, b) => a.score - b.score);
    }

    async start() {
        const storageData = await Game.getByIdFromStorage(this.id);
        this.hydrate(storageData);
        this.status = 'started';

        if (this.rows.length === 0) {
            const player = this.getNextPlayerToPlay();
            if (!player) {
                throw new Error('No player found');
            }
            const playerInRow = new PlayerInRow(player, 0, []);
            this.rows.push([playerInRow]);
            await this.save();
        }
    }

    async addDart(tempDart: number, _multiplier: number) {
        try {
            const dart = {
                score: tempDart,
                multiplier: _multiplier,
            };
            const player = this.getPlayerById(this.getCurrentPlayerInRow().player.id);
            const scoreDart = tempDart * _multiplier;

            if (!player) {
                throw new Error('Erreur addDart.playernotfound');
            }

            this.getCurrentPlayerInRow().addDart(dart);
            this.getCurrentPlayerInRow().setScore(this.getCurrentPlayerInRow().getScore() + scoreDart);
            player.setScore(player.getScore() - (scoreDart));

            await this.save();
            await this.playerFinish(player, dart);

        } catch (error) {
            alert(error);
        }
    }

    async playerFinish(player: Player, dart: DartsType) {
        if (!this.playerFinishIsValid(player, dart)) {
            return;
        }
        this.ranking.push(player);
        await this.alertFinish();
        await this.save();
    }

    async alertFinish() {
        if (this.ranking.length === this.players.length || this.isFinishAtFirst) {
            this.status = 'finished';
            alert(`${this.ranking[0].name} a gagné, la partie est finie`);
        } else if (this.ranking.length === 1) {
            alert(`${this.ranking[0].name} a gagné, la partie continue`);
        }
    }

    /*
    * Si le joueur depasse le score
    * on boucle sur les dart du playerInrow pour les effacer et ainsi incrementer le score du joueur
    *
    * */
    async resetCurrentPlayerInRow(player: Player | undefined) {
        if (!player) {
            throw new Error('Erreur resetCurrentPlayerInRow.playernotfound');
        }

        const newScore = this.getCurrentPlayerInRow().darts.reduce((acc, dart) => {
            return acc + (dart.score * dart.multiplier);
        }, 0);

        player.setScore(player.getScore() + newScore);
        this.getCurrentPlayerInRow().score = 0;

        await this.save();
    }

    async resetGame() {
        this.rows = [];
        this.ranking = [];
        this.status = 'pending';
        this.players.forEach((player) => {
            player.score = this.type === '501' ? 501 : 301;
        });

        await this.save();
    }

    playerCanPlay() {
        if (!this.playerHasAgainDart()) {
            return false;
        }

        if (this.playerHasOverScore()) {
            return false;
        }

        if (!this.finishValide)

        return true;
    }

    playerHasAgainDart() {
        return this.getCurrentPlayerInRow().getDartsCount() < 3;
    }

    playerHasOverScore() {
        return (this.currentPlayer()?.getScore() || 0) < 0;
    }

    finishValide() {
        const playerInRow = this.getCurrentPlayerInRow();
        const player = this.getPlayerById(playerInRow.player.id);
        const lastDart = playerInRow.getLastDart();
        if (!player) {
            throw new Error('Erreur ptest.playernotfound');
        }
        if (player.getScore() !== 0) {
            return true;
        }
        if (this.finishType === 'double') {
            return lastDart.multiplier == 2 || lastDart.multiplier === 3;
        }
    }

    playerFinishIsValid(player: Player, dart: DartsType) {
        if (player.getScore() !== 0) {
            return false;
        }

        if (this.finishType === 'double') {
            return dart.multiplier === 2 || dart.multiplier === 3;
        }

        return true;
    }

    async removeLastDart() {
        const dart = this.getCurrentPlayerInRow().removerLastDart();
        const player = this.getPlayerById(this.getCurrentPlayerInRow().player.id);
        player?.setScore(player?.getScore() + (dart.score * dart.multiplier));
        this.getCurrentPlayerInRow().setScore(this.getCurrentPlayerInRow().getScore() - (dart.score * dart.multiplier));
        await this.save();
    }

    getLastDart() {
        return this.getCurrentPlayerInRow().getLastDart();
    }

    refresh() {
        return this;
    }

    async nextPlayer() {
        //Avant de passer au suivant au cas ou le joueur actuel a depasse le score
        if (this.playerHasOverScore()) {
            await this.resetCurrentPlayerInRow(this.currentPlayer());
        }

        const player = this.getNextPlayerToPlay();

        if (!player) {
            throw new Error('No player found');
        }

        const playerInRow = new PlayerInRow(player, 0, []);

        if (player.getScore() === 0) {
            playerInRow.setScore(0);
            playerInRow.darts = DefaultDarts;
        }

        if (this.getCurrentRow().length === this.players.length) {
            this.rows.push([playerInRow]);
        } else {
            this.getCurrentRow().push(playerInRow);
        }

        await this.save();

        if (player.getScore() === 0) {
            await this.nextPlayer();
        }
    }

    async save() {
        await AsyncStorage.setItem(this.id, JSON.stringify(this));
        console.log('game saved');
    }

    async checkSetup() {
        if (this.players.length < 1) {
            throw new Error('Pas assez de joueur (1 min)');
        }
        this.players = this.players.filter((player) => player.name !== '');
    }

    static async getAllFromStorage() {
        return await AsyncStorage.getAllKeys()
            .then((keys) => {
                const filteredKeys = keys.filter((key) => {
                    return /darts.*/.test(key);
                });

                return AsyncStorage.multiGet(filteredKeys);
            })
            .then((keyValuePairs) => {
                return keyValuePairs.map((keyValuePair) => {
                    const [_id, value] = keyValuePair;
                    if (!value) {
                        return;
                    }

                    return JSON.parse(value);
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    static async getByIdFromStorage(id: string) {
        return await AsyncStorage.getItem(id)
            .then((value) => {
                return JSON.parse(value || '{}');
            })
            .catch((error) => {
                console.error(error);
            });

    }

    static async multiRemoveFromStorage(ids: string[]) {
        return await AsyncStorage.multiRemove(ids)
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.error(error);
            });
    }
}