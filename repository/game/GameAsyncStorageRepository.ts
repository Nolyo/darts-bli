import Repository from "../Repository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Game from "../../models/game";
import { GameType } from "../../types";

class GameAsyncStorageRepository implements Repository {
  deleteMany(item: any): void {}

  find(id: string): any {}

  async findAll(): Promise<GameType[]> {
    return await AsyncStorage.getAllKeys()
      .then((keys) => {
        const filteredKeys = keys.filter((key) => {
          return /darts.*/.test(key);
        });

        return AsyncStorage.multiGet(filteredKeys);
      })
      .then((keyValuePairs) => {
        const games = keyValuePairs
          .map((keyValuePair) => {
            const [_id, value] = keyValuePair;
            if (!value) {
              return null;
            }

            return JSON.parse(value);
          })
          .filter((g): g is GameType => g !== null);
        return games;
      })
      .catch((error) => {
        console.error(error);
        return [] as GameType[];
      });
  }

  save(item: any): void {}

  update(item: any): void {}
}
