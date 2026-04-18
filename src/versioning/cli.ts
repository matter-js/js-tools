/**
 * @license
 * Copyright 2022-2026 Greg Lauckhart <greg@lauckhart.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Package } from "../util/package.js";
import { Progress } from "../util/progress.js";
import { Versioner } from "./versioner.js";

export interface VersionArgs {
    version?: string;
    prefix?: string;
    set?: boolean;
    apply?: boolean;
    tag?: boolean;
}

export async function manageVersion(args: VersionArgs) {
    const pkg = new Package({ path: args.prefix });
    const versioner = new Versioner(pkg, args.version);

    const progress = new Progress();

    progress.startup(`Release ${versioner.version}`, versioner.pkg);
    if (args.set) {
        await progress.run(`Set version to ${progress.emphasize(versioner.version)}`, () => versioner.set());
    }

    if (args.apply) {
        await versioner.apply(progress);
    }

    if (args.tag) {
        await progress.run(`Tagging version ${progress.emphasize(versioner.version)}`, () => versioner.tag());
    }

    progress.close();
}
