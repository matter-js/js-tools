/**
 * @license
 * Copyright 2022-2026 Greg Lauckhart <greg@lauckhart.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarkdownStyles } from "./markdown-styles.js";
import type { Printer } from "./printer.js";
import { Style } from "./style.js";

const BOLD = Style([1]);

/**
 * A {@link Printer.Renderable} that renders a subset of markdown to the terminal.
 *
 * Supported syntax:
 *
 *   - `#` headings (h1 — bold + underline)
 *   - `##` headings (h2 — bold)
 *   - `###` headings (h3 — underline)
 *   - `####` headings (h4 — dim)
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

                // Heading: # through ####
                const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)/);
                if (headingMatch) {
                    if (!firstBlock) {
                        printer.write("\n");
                    }
                    firstBlock = false;

                    const level = headingMatch[1].length;
                    const content = headingMatch[2];
                    const headingStyles = [MarkdownStyles.h1, MarkdownStyles.h2, MarkdownStyles.h3, MarkdownStyles.h4];
                    const style = headingStyles[level - 1];

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
                        if (!prev.match(/^#{1,4}\s/) && !prev.match(/^[*-]\s/)) {
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
            using _cx = printer.state({ style: MarkdownStyles.code });
            printer.write(match[3]);
        }

        lastIndex = match.index + match[0].length;
    }

    // Trailing text
    if (lastIndex < text.length) {
        printer.write(text.slice(lastIndex));
    }
}
