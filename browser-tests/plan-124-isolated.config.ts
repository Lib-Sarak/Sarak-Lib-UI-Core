import { defineConfig } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

const TEST_TIMEOUT_MS = 240_000;

export default defineConfig({
    testDir: '.',
    testMatch: 'plan-124-sidebar-contrast.spec.ts',
    outputDir: path.join(os.tmpdir(), 'sarak-plan-124-playwright-results'),
    fullyParallel: false,
    workers: 1,
    timeout: TEST_TIMEOUT_MS,
    retries: 0,
    reporter: [['list']],
    use: {
        headless: true,
        launchOptions: process.env.SARAK_PLAN124_CHROMIUM_PATH
            ? { executablePath: process.env.SARAK_PLAN124_CHROMIUM_PATH }
            : undefined,
    },
});
