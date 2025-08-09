import AsyncStorage from "@react-native-async-storage/async-storage";
import Player from "./player";
import PlayerInRow from "./playerInRow";
import { DartsType } from "../types";
import {
  computeContractPoints,
  getContractForRound,
} from "../services/capital/contracts";

export default class Game {
  id: string;
  type: string;
  status: string;
  players: Player[];
  rows: PlayerInRow[][];
  ranking: Player[];
  finishType: "classic" | "double";
  isFinishAtFirst: boolean;

  constructor(
    id?: string | undefined,
    type = "501",
    status = "pending",
    players: Player[] = [],
    rows: PlayerInRow[][] = [],
    ranking: Player[] = [],
    finishType: "classic" | "double" = "classic",
    isFinishAtFirst = false
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
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return `darts${result}`;
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

  setTypesFinish(type: "classic" | "double") {
    this.finishType = type;
  }

  setFinishAtFirst(isFinishAtFirst: boolean) {
    this.isFinishAtFirst = isFinishAtFirst;
  }

  getRows() {
    return this.rows;
  }

  getCurrentRow() {
    if (this.rows.length === 0) {
      return null;
    }
    return this.rows[this.rows.length - 1];
  }

  getCurrentPlayerInRow() {
    const currentRow = this.getCurrentRow();
    if (!currentRow || currentRow.length === 0) {
      return null;
    }
    return currentRow[currentRow.length - 1];
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
        return new PlayerInRow(_player, playerInRow.score, playerInRow.darts);
      });
    });
    this.ranking = data.ranking.map((player: any) => {
      const newPlayer = new Player(player.id);
      newPlayer.hydrate(player);
      return newPlayer;
    });
  }

  getNextPlayerToPlay() {
    if (this.players.length === 0) return undefined;
    if (this.rows.length === 0) {
      return this.players.find((player) => player.order === 1);
    }
    const lastPlayerInRow = this.getCurrentPlayerInRow();
    if (!lastPlayerInRow) {
      return this.players.find((player) => player.order === 1);
    }
    const lastPlayerOrder = lastPlayerInRow.player.order;
    const nextOrder =
      lastPlayerOrder === this.players.length ? 1 : lastPlayerOrder + 1;
    return this.players.find((player) => player.order === nextOrder);
  }

  getPlayerOrderByScore() {
    return this.players.sort((a, b) => a.score - b.score);
  }

  async start() {
    const storageData = await Game.getByIdFromStorage(this.id);
    this.hydrate(storageData);
    this.status = "started";

    if (this.rows.length === 0) {
      const player = this.getNextPlayerToPlay();
      if (!player) {
        throw new Error("No player found");
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
      const currentPlayerInRow = this.getCurrentPlayerInRow();
      if (!currentPlayerInRow) {
        throw new Error("Aucun joueur en cours");
      }
      const player = this.getPlayerById(currentPlayerInRow.player.id);
      const scoreDart = tempDart * _multiplier;

      if (!player) {
        throw new Error("Erreur addDart.playernotfound");
      }

      // Enregistre la fléchette dans le tour courant
      currentPlayerInRow.addDart(dart);
      currentPlayerInRow.setScore(currentPlayerInRow.getScore() + scoreDart);

      // Logique spécifique Capital: on ne décrémente pas le score du joueur au fil des fléchettes,
      // l'attribution se fait en fin de tour via nextPlayer() selon le contrat.
      if (this.type === "Capital") {
        await this.save();
        return;
      }

      const preScore = player.getScore();
      const postScore = preScore - scoreDart;
      const isDoubleOut = this.finishType === "double";
      const isOver = postScore < 0;
      const isDoubleOutOne = isDoubleOut && postScore === 1;
      const isInvalidDoubleFinish =
        postScore === 0 && isDoubleOut && _multiplier !== 2;

      // Gestion des busts: score < 0, reste 1 en double-out, ou 0 sans double en double-out
      if (isOver || isDoubleOutOne || isInvalidDoubleFinish) {
        if (isOver) {
          alert("Score dépassé - tour annulé");
        } else if (isDoubleOutOne) {
          alert("Il doit rester 0 en fin de tour (double-out) - tour annulé");
        } else if (isInvalidDoubleFinish) {
          alert("Vous devez finir avec un double - tour annulé");
        }

        // Réinitialise le score du joueur pour ce tour
        await this.resetCurrentPlayerInRow(player);

        // Termine le tour immédiatement (plus de tirs)
        while (currentPlayerInRow.getDartsCount() < 3) {
          currentPlayerInRow.addDart({ score: 0, multiplier: 0 });
        }

        await this.save();
        return;
      }

      // Cas de fin valide
      if (postScore === 0) {
        player.setScore(0);
        await this.save();
        await this.playerFinish(player, dart);
        // Si la partie continue (pas de finish immédiat), on clôt le tour de suite
        // en complétant les fléchettes restantes avec des zéros pour afficher le bouton "Joueur Suivant"
        if (this.status !== "finished") {
          while (currentPlayerInRow.getDartsCount() < 3) {
            currentPlayerInRow.addDart({ score: 0, multiplier: 0 });
          }
          await this.save();
        }
        return;
      }

      // Cas normal
      player.setScore(postScore);
      await this.save();
    } catch (error) {
      alert(error);
    }
  }

  async playerFinish(player: Player, dart: DartsType) {
    if (!this.playerFinishIsValid(player, dart)) {
      return;
    }
    this.ranking.push(player);
    // Si l'option "finir au 1er gagnant" n'est pas cochée, on laisse la partie
    // continuer mais on ne met pas finished ici. L'UI/stores peuvent afficher
    // une notification festive pour prévenir qu'il y a un gagnant.
    await this.alertFinish();
    await this.save();
  }

  async alertFinish() {
    // Fin au 1er gagnant
    if (this.isFinishAtFirst && this.ranking.length >= 1) {
      this.status = "finished";
      return;
    }

    // Fin quand tous les joueurs ont terminé
    if (this.ranking.length === this.players.length) {
      // Cas 1 joueur: si l'option "finir au 1er gagnant" n'est pas cochée,
      // on reste en mode entraînement (pas de statut finished automatique)
      if (this.players.length === 1 && !this.isFinishAtFirst) {
        return;
      }
      this.status = "finished";
      return;
    }

    // si au moins un joueur a fini, on laisse l'UI afficher le classement
  }

  /*
   * Si le joueur depasse le score
   * on boucle sur les dart du playerInrow pour les effacer et ainsi incrementer le score du joueur
   *
   * */
  async resetCurrentPlayerInRow(player: Player | undefined) {
    if (!player) {
      throw new Error("Erreur resetCurrentPlayerInRow.playernotfound");
    }

    const currentPlayerInRow = this.getCurrentPlayerInRow();
    if (!currentPlayerInRow) {
      throw new Error("Aucun joueur en cours");
    }

    const newScore = currentPlayerInRow.darts.reduce((acc, dart) => {
      return acc + dart.score * dart.multiplier;
    }, 0);

    player.setScore(player.getScore() + newScore);
    currentPlayerInRow.score = 0;

    await this.save();
  }

  async resetGame() {
    this.rows = [];
    this.ranking = [];
    this.status = "pending";
    this.players.forEach((player) => {
      if (this.type === "501") {
        player.score = 501;
      } else if (this.type === "301") {
        player.score = 301;
      } else if (this.type === "Capital") {
        player.score = 0;
      } else {
        const parsed = parseInt(this.type, 10);
        player.score = isNaN(parsed) ? 501 : parsed;
      }
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

    return true;
  }

  playerHasAgainDart() {
    const currentPlayerInRow = this.getCurrentPlayerInRow();
    return currentPlayerInRow ? currentPlayerInRow.getDartsCount() < 3 : false;
  }

  playerHasOverScore() {
    return (this.currentPlayer()?.getScore() || 0) < 0;
  }

  playerFinishIsValid(player: Player, dart: DartsType) {
    if (player.getScore() !== 0) {
      return false;
    }

    if (this.finishType === "classic") {
      return true;
    }

    if (this.finishType === "double") {
      if (dart.multiplier !== 2) {
        alert("Vous devez finir avec un double, 0 point attribué");
      }
      return dart.multiplier === 2;
    }

    return false;
  }

  async removeLastDart() {
    const currentPlayerInRow = this.getCurrentPlayerInRow();
    if (!currentPlayerInRow) {
      throw new Error("Aucun joueur en cours");
    }

    const dart = currentPlayerInRow.removerLastDart();
    const player = this.getPlayerById(currentPlayerInRow.player.id);
    if (this.type !== "Capital") {
      // x01: on redonne les points soustraits
      player?.setScore(player?.getScore() + dart.score * dart.multiplier);
    }
    currentPlayerInRow.setScore(
      currentPlayerInRow.getScore() - dart.score * dart.multiplier
    );
    await this.save();
  }

  refresh() {
    return this;
  }

  async nextPlayer() {
    //Avant de passer au suivant au cas ou le joueur actuel a depasse le score
    if (this.playerHasOverScore()) {
      await this.resetCurrentPlayerInRow(this.currentPlayer());
    }

    // Capital: à la fin du tour du joueur courant, évaluer le contrat du round et attribuer les points
    if (this.type === "Capital") {
      const currentPlayerInRow = this.getCurrentPlayerInRow();
      if (!currentPlayerInRow) {
        throw new Error("Aucun joueur en cours");
      }
      const player = this.getPlayerById(currentPlayerInRow.player.id);
      if (!player) {
        throw new Error("Joueur introuvable");
      }
      const roundIndex = Math.max(0, this.rows.length - 1);
      const contract = getContractForRound(roundIndex);
      const points = computeContractPoints(
        contract.key as any,
        currentPlayerInRow.getDarts()
      );
      if (points > 0) {
        player.setScore(player.getScore() + points);
      }
      await this.save();
    }

    const player = this.getNextPlayerToPlay();

    if (!player) {
      throw new Error("No player found");
    }

    const playerInRow = new PlayerInRow(player, 0, []);

    if (this.type !== "Capital" && player.getScore() === 0) {
      playerInRow.setScore(0);
      playerInRow.darts = [
        {
          score: 0,
          multiplier: 0,
        },
        {
          score: 0,
          multiplier: 0,
        },
        {
          score: 0,
          multiplier: 0,
        },
      ];
    }

    const currentRow = this.getCurrentRow();
    if (!currentRow || currentRow.length === this.players.length) {
      // Si Capital: si on vient d'achever le 14e round (rows.length === 14), on termine la partie
      if (
        this.type === "Capital" &&
        currentRow &&
        currentRow.length === this.players.length
      ) {
        if (this.rows.length >= 14) {
          this.status = "finished";
          await this.save();
          return;
        }
      }
      this.rows.push([playerInRow]);
    } else {
      currentRow.push(playerInRow);
    }

    await this.save();
    if (this.type !== "Capital" && player.getScore() === 0) {
      await this.nextPlayer();
    }
  }

  async save() {
    await AsyncStorage.setItem(this.id, JSON.stringify(this));
    console.log("game saved");
  }

  async checkSetup() {
    if (this.players.length < 1) {
      throw new Error("Pas assez de joueur (1 min)");
    }
    this.players = this.players.filter((player) => player.name !== "");
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
        return JSON.parse(value || "{}");
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
