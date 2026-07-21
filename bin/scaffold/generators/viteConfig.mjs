/**
 * \`manualChunks\` do Golden Path (Spec 40 §2.2): separa SÓ \`react\`/\`react-dom\` (sempre
 * carregados de qualquer forma, nunca lazy) num chunk \`vendor-react\` próprio, para que
 * eles tenham cache de longo prazo independente do resto — apps trocam de versão de
 * app com frequência, não de React.
 *
 * ARMADILHA (medida na prática, Spec 40): incluir \`@sarak/lib-ui-core\` (ou "todo
 * node_modules restante") nesta função FUNDE os chunks lazy internos da lib (o
 * \`SarakPDFViewerImpl\`/\`SarakFlowEngine\`/\`prism\`/etc., já divididos via
 * \`React.lazy\`+\`import()\` dinâmico no \`LeafNode\`) de volta num único chunk gigante —
 * o \`manualChunks\` tem prioridade sobre o particionamento automático por \`import()\`
 * dinâmico do Rollup/Vite, então qualquer regra que capture esses módulos por engano
 * apaga o code-splitting que já existe. Por isso a função NÃO tenta agrupar o restante
 * de \`node_modules\` — deixa o particionamento automático (que já preserva os limites
 * de \`import()\` dinâmico) cuidar do resto.
 */
const MANUAL_CHUNKS_SNIPPET = `        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-react';
                    return undefined;
                },
            },
        },`;

/** `vite.config.ts` do Golden Path — proxy `/api` → o backend Express (Spec 21 §2.3). */
export function buildViteConfig({ answers }) {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Gerado por \`npx @sarak/lib-ui-core init\` (Golden Path vite-express).
export default defineConfig({
    plugins: [react()],
    build: {
${MANUAL_CHUNKS_SNIPPET}
    },
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
    build: {
${MANUAL_CHUNKS_SNIPPET}
    },
    server: {
        port: ${answers.frontendPort},
    },
});
`;
}
