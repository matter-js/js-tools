/**
 * @license
 * Copyright 2022-2026 Matter.js Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ansi, type TextBuilder } from "./text-builder.js";

/**
 * Semantic styles for Markdown rendering.
 *
 * Each binding is a {@link TextBuilder} that can be reassigned for theme customization.
 */
export namespace MarkdownStyles {
    export let h1: TextBuilder = ansi.bold.underline;
    export let h2: TextBuilder = ansi.bold;
    export let h3: TextBuilder = ansi.underline;
    export let h4: TextBuilder = ansi.dim;
    export let code: TextBuilder = ansi.cyan;
}
