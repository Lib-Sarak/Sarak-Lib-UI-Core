import { defineConfig } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

export default defineConfig({
    testDir: '.',
    testMatch: 'chrome-theme-identity.spec.ts',
    outputDir: path.join(os.tmpdir(), 'sarak-chrome-theme-identity-results'),
    fullyParallel: false,
    workers: 1,
    timeout: 240_000,
    retries: 0,
    reporter: [['list']],
    use: {
        headless: true,
        launchOptions: process.env.SARAK_CHROMIUM_PATH
            ? { executablePath: process.env.SARAK_CHROMIUM_PATH }
            : undefined,
    },
});
