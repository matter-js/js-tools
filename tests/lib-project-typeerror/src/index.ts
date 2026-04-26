export function greet(name: string): string {
    const wrong: number = "this is a string, not a number";
    return `hello ${name} ${wrong}`;
}
