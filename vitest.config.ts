import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/__e2e__/**', '**/*.spec.ts', '**/*.spec.tsx'],
        // Workers reutilizados acumulam heap do jsdom entre arquivos e estouravam o
        // teto default do Node (~4GB) em lotes grandes ("vitest run" completo caía
        // por OOM). Teto explícito de 8GB por worker (Vitest 4: opção top-level;
        // `poolOptions` foi removido e era ignorado em silêncio).
        pool: 'forks',
        execArgv: ['--max-old-space-size=8192'],
        // R8.1 (piso móvel, plan-12) — só ativa com `--coverage` (não no
        // `pre-push`, que roda a suíte pura por custo). `json-summary` é o
        // formato que `check-coverage-floor.mjs` lê.
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/__tests__/**', 'src/**/__e2e__/**', 'src/**/*.d.ts', 'src/core/Provider/generated/**'],
        },
    },
});
