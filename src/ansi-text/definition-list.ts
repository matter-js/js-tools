/**
 * @license
 * Copyright 2022-2026 Matter.js Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Markdown } from "./markdown.js";
import { Printer } from "./printer.js";
import { Style } from "./style.js";
import { visibleWidthOf } from "./visible-width-of.js";

const DIM = Style([2]);

/**
 * A {@link Printer.Renderable} that renders a two-column name/description list.
 *
 * Name column width is computed from entries, capped at ~40% of terminal width. When a name exceeds the column width,
 * the description wraps to the next line indented to the description column.
 *
 * String descriptions are rendered as {@link Markdown}.
 */
export function DefinitionList(entries: DefinitionList.Entry[]): Printer.Renderable {
    return {
        renderTo(printer: Printer) {
            if (!entries.length) {
                return;
            }

            const terminalWidth = printer.state.terminalWidth ?? 80;
            const maxNameWidth = Math.min(
                Math.max(...entries.map(e => widthOf(e.name))),
                Math.floor(terminalWidth * 0.4),
            );
            const gutter = 2;
            const indent = 2;
            const nameCol = maxNameWidth + indent + gutter;

            for (const entry of entries) {
                const nameWidth = widthOf(entry.name);

                // Name column — wrapping disabled so padding spaces aren't collapsed
                {
                    using _nowrap = printer.state({ wrap: false });

                    printer.write("".padEnd(indent));
                    if (Printer.isRenderable(entry.name)) {
                        entry.name.renderTo(printer);
                    } else {
                        printer.write(entry.name);
                    }

                    if (nameWidth > maxNameWidth) {
                        printer.write("\n", "".padEnd(nameCol));
                    } else {
                        printer.write("".padEnd(maxNameWidth - nameWidth + gutter));
                    }
                }

                // Description — dim, continuation lines indented to description column
                using _cx = printer.state({ style: DIM, wrapIndent: nameCol });
                if (Printer.isRenderable(entry.description)) {
                    entry.description.renderTo(printer);
                } else if (entry.description) {
                    Markdown(entry.description).renderTo(printer);
                }

                printer.write("\n");
            }
        },
    };
}

function widthOf(name: string | Printer.Renderable): number {
    if (typeof name === "string") {
        return visibleWidthOf(name);
    }
    // For Renderable names we can't easily measure width; estimate 0 so it always overflows
    return 0;
}

export namespace DefinitionList {
    export interface Entry {
        name: string | Printer.Renderable;
        description: string | Printer.Renderable;
    }
}
