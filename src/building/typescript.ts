/**
 * @license
 * Copyright 2022-2026 Greg Lauckhart <greg@lauckhart.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { type TypescriptContext } from "./typescript/context.js";
import { createSolutionBuilderContext } from "./typescript/solution-builder.js";
export { copyDeclarationsToCjs, createTsgoContext, tsgoSolutionBuild } from "./typescript/tsgo.js";

/**
 * Create a {@link TypescriptContext} for validating types and optionally emitting .d.ts file.
 *
 * We have multiple implementations as we've tried TS API variants.  We export the one we currently use here.
 */
export const createTypescriptContext = createSolutionBuilderContext;
