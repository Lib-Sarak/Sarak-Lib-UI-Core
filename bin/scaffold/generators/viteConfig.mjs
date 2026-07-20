/** `vite.config.ts` do Golden Path — proxy `/api` → o backend Express (Spec 21 §2.3). */
export function buildViteConfig({ answers }) {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Gerado por \`npx @sarak/lib-ui-core init\` (Golden Path vite-express).
export default defineConfig({
    plugins: [react()],
    server: {
        port: ${answers.frontendPort},
        proxy: {
            '/api': {
                target: 'http://localhost:${answers.backendPort}',
                changeOrigin: true,
            },
        },
    },
});
`;
}

/** Variante `frontend-only`: sem proxy (o backend é externo, em outra linguagem/porta). */
export function buildFrontendOnlyViteConfig({ answers }) {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Gerado por \`npx @sarak/lib-ui-core init\` (stack frontend-only).
export default defineConfig({
    plugins: [react()],
    server: {
        port: ${answers.frontendPort},
    },
});
`;
}
