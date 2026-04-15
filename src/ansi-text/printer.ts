/**
 * @license
 * Copyright 2022-2026 Matter.js Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Consumer } from "./consumer.js";
import { Producer } from "./producer.js";
import { TextWriter } from "./text-writer.js";
import { Truncator } from "./truncator.js";
import { Wrapper } from "./wrapper.js";

/**
 * Text output with high-level formatting functionality.
 */
export interface Printer extends Consumer {
    (...text: Printer.Sequence): void;

    target: Consumer;
    write(...text: Printer.Sequence): void;

    writeTruncated(...text: Producer.Sequence): void;
    writeTruncatedLine(...text: Producer.Sequence): void;
}

export function Printer(out: Printer.Output, options?: Printer.Options): Printer;
export function Printer(target: Consumer, options?: Printer.Options): Printer;

export function Printer(targetOrOut: Consumer | Printer.Output, options?: Printer.Options) {
    let target: Consumer;
    if (typeof targetOrOut === "function") {
        const writer = new TextWriter(text => targetOrOut(text), { terminalWidth: options?.terminalWidth });
        if (options?.styleEnabled !== undefined) {
            writer.state.styleEnabled = options.styleEnabled;
        }
        target = writer;
    } else {
        target = targetOrOut;
    }
    target = options?.wrap ? new Wrapper(target, options.wrap) : target;
    let truncator: undefined | Truncator;

    const printer = function Printer(...text: Printer.Sequence) {
        printer.write(...text);
    } as Printer;

    function writeItems(...text: Printer.Sequence) {
        const pending: Producer.Sequence = [];

        function flush() {
            if (pending.length) {
                target.write(...pending);
                pending.length = 0;
            }
        }

        for (const item of text) {
            if (Printer.isRenderable(item)) {
                flush();
                item.renderTo(printer);
            } else {
                pending.push(item as Producer.Sequence[number]);
            }
        }

        flush();
    }

    Object.defineProperties(printer, {
        target: {
            get() {
                return target;
            },
        },

        state: {
            get() {
                return target.state;
            },
        },

        write: {
            value: writeItems,
        },

        close: {
            value() {
                target.close();
            },
        },

        writeTruncated: {
            value(...text: string[]) {
                if (!truncator) {
                    truncator = new Truncator(target, { addNewline: false });
                }
                truncator.write(...text);
            },
        },

        writeTruncatedLine: {
            value(...text: string[]) {
                const tokens = [...Producer.of(text)].filter(
                    token => token.kind !== "newline" && token.kind !== "carriage-return",
                );
                if (!truncator) {
                    truncator = new Truncator(target);
                }
                truncator.write(...tokens);
            },
        },
    });

    return printer;
}

export namespace Printer {
    /**
     * A simple text output function.
     */
    export type Output = (text: string) => void;

    export interface Options extends Consumer.Options {
        wrap?: Wrapper.Options;
    }

    /**
     * An object that can render itself to a {@link Printer}.
     */
    export interface Renderable {
        renderTo(printer: Printer): void;
    }

    /**
     * Extended sequence type that accepts {@link Renderable} in addition to standard {@link Producer.Sequence} items.
     */
    export type Sequence = Array<string | import("./token.js").Token | Producer | Renderable>;

    export function isRenderable(item: Sequence[number]): item is Renderable {
        return typeof item === "object" && item !== null && "renderTo" in item && typeof item.renderTo === "function";
    }
}
