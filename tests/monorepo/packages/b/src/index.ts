import { tag } from "@nacho-smoke/a";

export function shout(msg: string): string {
    return tag(msg).toUpperCase();
}
