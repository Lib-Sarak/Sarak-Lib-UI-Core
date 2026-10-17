import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    testMatch: 'arsenal-lote4-source.spec.ts',
    fullyParallel: false,
    workers: 1,
    timeout: 240_000,
    retries: 0,
    reporter: [['list']],
    use: { headless: true },
});
