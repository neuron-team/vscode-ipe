
export class Interpreter {
    static run(code: string) : Promise<string> {
        return new Promise<string>(resolve => resolve("sample output result!"));
    }
}
