/**
 * @license
 * Copyright 2022-2026 Greg Lauckhart <greg@lauckhart.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { rm } from "node:fs/promises";
import { Package } from "../util/package.js";

/**
 * Delete the workspace's lockfile and all `node_modules` directories so that `npm install` can regenerate them.
 *
 * Operates on the workspace root and every workspace member.  For a single-package repo that's just the one package.
 */
export async function relock() {
    const workspace = Package.workspace;

    await rm(workspace.resolve("package-lock.json"), { force: true });
    await rm(workspace.resolve("node_modules"), { recursive: true, force: true });

    const workspaces = workspace.json.workspaces;
    if (Array.isArray(workspaces)) {
        for (const path of workspaces) {
            await rm(workspace.resolve(path, "node_modules"), {
                recursive: true,
                force: true,
            });
        }
    }
}
