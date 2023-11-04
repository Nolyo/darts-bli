import {GameType} from "../types";

export default interface Repository {
    save(item: any): void;
    update(item: any): void;
    deleteMany(item: any): void;
    find(id: string): any;
    findAll(): Promise<GameType[]>;
}