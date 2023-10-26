import AsyncStorage from '@react-native-async-storage/async-storage';
import Player from './player';

export default class Game {
    id: string;
    type: string;
    players: Player[];

    constructor(id: string) {
        this.id = id;
        this.type = '501';
        this.players = [];
    }

    getGameId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    getPlayers() {
        return this.players;
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    getNextPlayerId() {
        return this.players.length + 1;
    }

    getPlayersCount() {
        return this.players.length;
    }

    setType(type: string) {
        this.type = type;
    }

    updatePlayer(player: Player) {
        this.players = this.players.map((p) => {
            if (p.id === player.id) {
                return player;
            }
            return p;
        });
    }

    async save() {
        await AsyncStorage.setItem(this.id, JSON.stringify(this));
    }

}