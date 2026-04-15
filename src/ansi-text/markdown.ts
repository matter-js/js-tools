/**
 * @license
 * Copyright 2022-2026 Matter.js Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Printer } from "./printer.js";
import { Style } from "./style.js";

const BOLD = Style([1]);
const BOLD_UNDERLINE = Style([1, 4]);
const CODE = Style([36]); // cyan

/**
 * A {@link Printer.Renderable} that renders a subset of markdown to the terminal.
 *
 * Supported syntax:
 *
 *   - `#` headings (bold + underline)
 *   - `##` headings (bold)
 *   - `**bold**` inline
 *   - `` `code` `` inline (cyan)
 *   - `*` / `-` unordered bullet lists
 *   - Blank-line-separated paragraphs with word wrap
 */
export function Markdown(text: string): Printer.Renderable {
    return {
        renderTo(printer: Printer) {
            const lines = text.split("\n");

            let inList = false;
            let firstBlock = true;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trimStart();

                // Blank line — end current block
                if (trimmed === "") {
                    if (inList) {
                        inList = false;
                    }
                    continue;
                }

                // Heading: # or ##
                const headingMatch = trimmed.match(/^(#{1,2})\s+(.*)/);
                if (headingMatch) {
                    if (!firstBlock) {
                        printer.write("\n");
                    }
                    firstBlock = false;

                    const level = headingMatch[1].length;
                    const content = headingMatch[2];
                    const style = level === 1 ? BOLD_UNDERLINE : BOLD;

                    using _cx = printer.state({ style });
                    printer.write(content, "\n");
                    continue;
                }

                // Bullet list item: * or -
                const bulletMatch = trimmed.match(/^[*-]\s+(.*)/);
                if (bulletMatch) {
                    if (!inList && !firstBlock) {
                        printer.write("\n");
                    }
                    inList = true;
                    firstBlock = false;

                    printer.write("  ");
                    renderInline(printer, bulletMatch[1]);
                    printer.write("\n");
                    continue;
                }

                // Paragraph text
                if (!inList && !firstBlock) {
                    // Check if previous non-blank line was also paragraph text (continuation)
                    let prevWasParagraph = false;
                    for (let j = i - 1; j >= 0; j--) {
                        const prev = lines[j].trimStart();
                        if (prev === "") {
                            break;
                        }
                        if (!prev.match(/^#{1,2}\s/) && !prev.match(/^[*-]\s/)) {
                            prevWasParagraph = true;
                        }
                        break;
                    }
                    if (!prevWasParagraph) {
                        printer.write("\n");
                    }
                }
                firstBlock = false;

                renderInline(printer, trimmed);
                printer.write("\n");
            }
        },
    };
}

/**
 * Render inline markdown: `**bold**` and `` `code` ``.
 */
function renderInline(printer: Printer, text: string) {
    // Match **bold** or `code` segments
    const pattern = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        // Text before the match
        if (match.index > lastIndex) {
            printer.write(text.slice(lastIndex, match.index));
        }

        if (match[2] !== undefined) {
            // **bold**
            using _cx = printer.state({ style: BOLD });
            printer.write(match[2]);
        } else if (match[3] !== undefined) {
            // `code`
            using _cx = printer.state({ style: CODE });
            printer.write(match[3]);
        }

        lastIndex = match.index + match[0].length;
    }

    // Trailing text
    if (lastIndex < text.length) {
        printer.write(text.slice(lastIndex));
    }
}
