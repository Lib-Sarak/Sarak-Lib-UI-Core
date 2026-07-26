/**
 * `manualChunks` do Golden Path (Spec 40 §2.2): separa SÓ `react`/`react-dom` (sempre
 * carregados de qualquer forma, nunca lazy) num chunk `vendor-react` próprio, para que
 * eles tenham cache de longo prazo independente do resto — apps trocam de versão de
 * app com frequência, não de React.
 *
 * ARMADILHA (medida na prática, Spec 40): incluir `@sarak/lib-ui-core` (ou "todo
 * node_modules restante") nesta função FUNDE os chunks lazy internos da lib (o
 * `SarakPDFViewerImpl`/`SarakFlowEngine`/`prism`/etc., já divididos via
 * `React.lazy`+`import()` dinâmico no `LeafNode`) de volta num único chunk gigante —
 * o `manualChunks` tem prioridade sobre o particionamento automático por `import()`
 * dinâmico do Rollup/Vite, então qualquer regra que capture esses módulos por engano
 * apaga o code-splitting que já existe. Por isso a função NÃO tenta agrupar o restante
 * de `node_modules` — deixa o particionamento automático (que já preserva os limites
 * de `import()` dinâmico) cuidar do resto.
 */
/**
 * Nota que vai NO ARQUIVO GERADO (Spec 41 §2.4): encerra por escrito a expectativa
 * errada de que "bundle grande" se resolve mexendo em `manualChunks`. Vale para o
 * consumidor, que é quem lê este arquivo quando o build parece pesado.
 */
const NOTA_PISO_DE_BUNDLE = `// ────────────────────────────────────────────────────────────────────────────
// Sobre o tamanho do bundle (medido, não teórico — Spec 41):
//
// \`manualChunks\` NÃO reduz bytes. Ele só decide em QUAL arquivo cada byte cai.
// Reduzir o que o browser baixa no boot depende de duas coisas, ambas na origem:
//
//   1) nada de acesso DINÂMICO a barril de biblioteca (\`Icons[nomeEmRuntime]\`):
//      o bundler não sabe qual membro será usado e mantém a biblioteca inteira.
//      Medido: um \`lucide-react\` inteiro custava 789 KB no chunk principal; com
//      o mapa curado do \`SarakIcon\` isso caiu para 56 KB (−93%).
//   2) coisa pesada atrás de fronteira \`React.lazy\` + \`import()\`: foi o que tirou
//      echarts/zrender/recharts (~2,7 MB) do chunk principal para um chunk sob
//      demanda. Resultado das duas juntas: 3203 KB → 1531 KB no boot (−52%).
//
// Também medido e SEM efeito: trocar \`export * from '@sarak/lib-ui-core'\` por
// imports nomeados no seu barril não muda um byte — o Rollup já resolve o grafo
// da mesma forma nos dois casos. Não perca tempo com isso.
// ────────────────────────────────────────────────────────────────────────────`;

const MANUAL_CHUNKS_SNIPPET = `        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-react';
                    return undefined;
                },
            },
        },`;

/**
 * `vite.config.ts` do starter padrão (Spec 45) — front puro, sem backend próprio
 * para fazer proxy (Design Engine persiste em localStorage; Spec 44).
 */
export function buildViteConfig({ answers }) {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Gerado por \`npx @sarak/lib-ui-core init\` (starter padrão — módulos-plugin, Spec 45).

${NOTA_PISO_DE_BUNDLE}

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
