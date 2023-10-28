import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './player';
import PlayerInRow from "./playerInRow";

export default class Game {
    id: string;
    type: string;
    status: string;
    players: Player[];
    rows: PlayerInRow[][];

    constructor(
        id?: string | undefined,
        type = '501',
        status = 'pending',
        players: Player[] = [],
        rows: PlayerInRow[][] = []
    ) {
        this.id = id || this.generateId();
        this.type = type;
        this.status = status;
        this.players = players;
        this.rows = rows;
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
        this.players = data.players.map((player: any) => {
            const newPlayer = new Player(player.id);
            newPlayer.hydrate(player);
            return newPlayer;
        });
        this.rows = data.rows.map((row: any) => {
            return row.map((playerInRow: any) =>
                new PlayerInRow(new Player(playerInRow.player.id), playerInRow.player.score, playerInRow.darts));
        });
    }

    getNextPlayerToPlay() {
        if (this.rows.length === 0) {
            //TODO: move in Player
            return this.players.find((player) => {
                return player.order === 1;
            });
        } else {
            const lastPlayerInRow = this.getCurrentPlayerInRow();
            const lastPlayer = lastPlayerInRow.player;
            const lastPlayerOrder = lastPlayer.order;

            if (lastPlayerOrder === this.players.length) {
                return this.players.find((player) => {
                    return player.order === 1;
                });
            }

            return this.players.find((player) => {
                return player.order === lastPlayerOrder + 1;
            });
        }
    }

    async start() {
        const storageData = await Game.getByIdFromStorage(this.id);
        this.hydrate(storageData);

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
        const dart = {
            score: tempDart,
            multiplier: _multiplier,
        };
        this.getCurrentPlayerInRow().addDart(dart);
        this.getCurrentPlayerInRow().setScore(tempDart * _multiplier);

        const player = this.getPlayerById(this.getCurrentPlayerInRow().player.id);
        player?.setScore(player?.getScore() - (tempDart * _multiplier));

        if (player?.getScore() === 0) {
            console.log('player win');
        }

        if (this.getCurrentPlayerInRow().getDartsCount() === 3) {
            await this.nextPlayer()
        }

        await this.save();
    }

    refresh(){
        return this;
    }

    // si c est le dernier joueur de la row on ajoute une row
    // sinon on ajoute une playerInRow dans la current row
    async nextPlayer() {
        const player = this.getNextPlayerToPlay();
        if (!player) {
            throw new Error('No player found');
        }
        const playerInRow = new PlayerInRow(player, 0, []);

        if (this.getCurrentRow().length === this.players.length) {
            console.log('new row')
            this.rows.push([playerInRow]);
        } else {
            console.log('new player in row')
            this.getCurrentRow().push(playerInRow);
        }
    }

    async save() {
        await AsyncStorage.setItem(this.id, JSON.stringify(this));
        console.log('game saved');
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
                    const [id, value] = keyValuePair;
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

    static async deleteByIdFromStorage(id: string) {
        return await AsyncStorage.removeItem(id)
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.error(error);
            });
    }

}