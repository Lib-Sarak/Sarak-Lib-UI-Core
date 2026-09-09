import { defineConfig } from '@playwright/test';

/**
 * Config MÍNIMA, escopada só a este diretório — `testDir` explícito para o comando
 * `npx playwright test --config=browser-tests/playwright.config.ts` nunca variar por
 * onde é invocado, e para nunca colidir com os testes `jsdom` do Vitest (que vivem em
 * `src/`, fora desta árvore). Sem `webServer`: o harness é `file://` estático — ver
 * `build-harness.mjs`.
 */
export default defineConfig({
    testDir: '.',
    testMatch: '**/*.spec.ts',
    fullyParallel: true,
    retries: 0,
    reporter: [['list']],
    use: {
        headless: true,
    },
});
