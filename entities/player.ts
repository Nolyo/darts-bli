export default class Player {
    id: number;
    name: string;
    score: number;
    order: number;

    constructor(id: number) {
        this.id = id;
        this.name = "";
        this.score = 0;
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
    
}
