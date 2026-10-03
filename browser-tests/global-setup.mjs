import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HARNESS_URL_ENV = 'SARAK_CROMO_HARNESS_URL';

export default async function globalSetup() {
    const { outDir, htmlPath } = await buildHarness();
    process.env[HARNESS_URL_ENV] = pathToFileURL(htmlPath).href;

    return async function teardownGlobalHarness() {
        delete process.env[HARNESS_URL_ENV];
        fs.rmSync(outDir, { recursive: true, force: true });
    };
}
