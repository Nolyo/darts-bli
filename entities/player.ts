export default class Player {
    id: number;
    name: string;
    score: number;
    order: number;

    constructor(id: number, score: number = 0) {
        this.id = id;
        this.name = "";
        this.score = score;
        this.order = id;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getScore() {
        return this.score;
    }

    getOrder() {
        return this.order;
    }

    setName(name: string) {
        this.name = name;
    }

    setScore(score: number) {
        this.score = score;
    }

    setOrder(order: number) {
        this.order = order;
    }

    hydrate(data: any) {
        this.name = data.name;
        this.score = data.score;
        this.order = data.order;
    }
    
}
