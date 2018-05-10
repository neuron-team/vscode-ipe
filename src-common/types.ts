
export class Card {
    public collapsed: boolean = false;
    public codeCollapsed: boolean = true;
    public outputCollapsed: boolean = false;
    public state: string = "notSelected";
    constructor(
        public id: number,
        public title: string,
        public sourceCode: string,
        public outputs: CardOutput[],
    ) {}
}

export class CardOutput {
    constructor(
        public type: string,
        public output: string
    ) {}
}
