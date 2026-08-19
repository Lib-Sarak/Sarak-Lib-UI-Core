// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/**
 * Achado 39 (specs/15-divida-conhecida.md §3.1): o gerador interpolava tokens
 * responsivos (`defaultValue: { mob, tab, desk }`) crus, produzindo
 * `chave: [object Object],` — o gabarito não fazia parse. O aceite anterior
 * (`plan-24-1`) contava CHAVES (422 ✓) e nunca validou VALORES; este teste
 * gera o gabarito de verdade e COMPILA a saída, falhando se ela não fizer parse.
 */

const SCRIPT = path.join('.agents/skills/ui-criar-tema/scripts/generate_theme_template.ts');
const THEMES_DIR = path.join(process.cwd(), 'src/core/Design/presets/themes');

// Sufixo aleatório, só de letras: `.claude/skills` é symlink para `.agents/skills` (memória de
// sessão "espelho-claude-e-symlink") e o mesmo arquivo de teste é rastreado E RODA duas vezes na
// suíte, uma por caminho — um id fixo faria as duas execuções colidirem escrevendo o mesmo arquivo
// em `src/core/Design/presets/themes/`. E sem dígito após hífen: `-([a-z])` na conversão para
// camelCase do gerador não casa dígito, e um id como "achado-39" produziria um identificador JS
// inválido (`debugTeste-39Theme`) — bug diferente do achado 39, fora do escopo desta plan.
const RANDOM_SUFFIX = Array.from({ length: 6 }, () =>
    'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)],
).join('');
const TEMP_THEME_ID = `teste-gabarito-compila-gerador-${RANDOM_SUFFIX}`;
const tempFile = path.join(THEMES_DIR, `${TEMP_THEME_ID}.ts`);

describe('generate_theme_template — o gabarito gerado compila (achado 39)', () => {
    afterEach(() => {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    });

    // Timeout alargado (padrão do vitest é 5000ms): o teste sobe um processo `npx tsx` de verdade,
    // que transpila e importa dinamicamente os ~28 arquivos de schema — sob a suíte INTEIRA
    // (contenção de CPU/IO com todos os outros arquivos rodando), isso passa dos 5s por acaso,
    // não por lentidão do gerador em si (medido isolado: ~2s).
    it('achata tokens responsivos para o eixo desk e produz um arquivo que compila sem erro de sintaxe', () => {
        execSync(`npx tsx "${SCRIPT}" ${TEMP_THEME_ID}`, { cwd: process.cwd(), stdio: 'pipe' });
        expect(fs.existsSync(tempFile)).toBe(true);

        const content = fs.readFileSync(tempFile, 'utf-8');

        // O sintoma direto do achado 39: token responsivo virando texto cru.
        expect(content).not.toContain('[object Object]');
        // `sidebarWidth` é responsivo (`{ mob: 200, tab: 220, desk: 240 }`, navigation.ts) —
        // prova de que a serialização achata para o eixo `desk`, a convenção dos 23 temas embarcados.
        expect(content).toMatch(/sidebarWidth:\s*240,/);

        const { diagnostics } = ts.transpileModule(content, {
            reportDiagnostics: true,
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
        });
        const syntaxErrors = (diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
        const detail = syntaxErrors
            .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
            .join('\n');

        expect(syntaxErrors, detail).toHaveLength(0);
    }, 30000);
});
