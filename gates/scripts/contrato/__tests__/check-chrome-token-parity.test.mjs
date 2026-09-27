// @vitest-environment node
// Teste do PRÓPRIO GATE (Spec 05 §2.4.1): tokens de cromo do painel (`sidebarPosition`,
// `sidebarHoverColor`, etc.) podem ter consumidor no `SarakShell` mas nenhum no
// `SarakAppChrome` — o painel confirmaria a mudança, a tela do modo ui-kit não reagiria.
// Casos PLANTADOS que o gate PEGA (token sem consumidor num lado, nos dois) e os que
// ele DEIXA PASSAR (token referenciado pelo `id`, por `cssVars` ou pelo auto-derivado
// `--sarak-<kebab>`, no átomo compartilhado) — e, por fim, o repositório real.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it, afterEach } from 'vitest';
import { ORPHAN_TOKENS, checkChromeTokenParity, getChromeTokens, tokenHasConsumer } from '../check-chrome-token-parity.mjs';

const scratchDirs = [];

function makeFixtureRoot(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-chrome-token-parity-'));
    scratchDirs.push(root);
    for (const [relPath, content] of Object.entries(files)) {
        const full = path.join(root, relPath);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    return root;
}

afterEach(() => {
    while (scratchDirs.length) {
        fs.rmSync(scratchDirs.pop(), { recursive: true, force: true });
    }
});

describe('tokenHasConsumer', () => {
    const token = { id: 'sidebarPosition', cssVars: [] };

    it('PEGA: id ausente do conteúdo — sem consumidor', () => {
        expect(tokenHasConsumer(token, 'export const x = 1;')).toBe(false);
    });

    it('DEIXA PASSAR: id referenciado como identificador (destructuring)', () => {
        expect(tokenHasConsumer(token, 'const { sidebarPosition } = design;')).toBe(true);
    });

    it('DEIXA PASSAR: auto-derivado --sarak-<kebab> em CSS var', () => {
        expect(tokenHasConsumer(token, "style.left = 'var(--sarak-sidebar-position, left)';")).toBe(true);
    });

    it('DEIXA PASSAR: cssVar declarado no schema (nome que NÃO é o auto-derivado)', () => {
        const comCssVar = { id: 'tabGap', cssVars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap'] };
        expect(tokenHasConsumer(comCssVar, "gap: 'var(--theme-tab-gap, 8px)'")).toBe(true);
    });

    it('PEGA: id como SUBSTRING de outro identificador não conta (word boundary)', () => {
        // "sidebarPositionX" contém "sidebarPosition" como substring, mas não é o token.
        expect(tokenHasConsumer(token, 'const sidebarPositionX = 1;')).toBe(false);
    });
});

describe('checkChromeTokenParity', () => {
    const tokens = [{ id: 'meuToken', cssVars: ['--meu-token-alias'] }];

    it('PLANTADO: token sem consumidor em NENHUM dos dois grupos — reprova nos dois', () => {
        const root = makeFixtureRoot({
            'shell/Nav.tsx': 'export const Nav = () => null;',
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
        });
        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: [] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        const missing = checkChromeTokenParity({ root, tokens, groups });
        expect(missing).toEqual([{ id: 'meuToken', semConsumidor: ['SarakShell', 'SarakAppChrome'] }]);
    });

    it('PLANTADO: token com consumidor só de UM lado — reprova só o lado que falta', () => {
        const root = makeFixtureRoot({
            'shell/Nav.tsx': 'const { meuToken } = design;',
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
        });
        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: [] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        const missing = checkChromeTokenParity({ root, tokens, groups });
        expect(missing).toEqual([{ id: 'meuToken', semConsumidor: ['SarakAppChrome'] }]);
    });

    it('DEIXA PASSAR: token consumido nos dois lados — lista vazia', () => {
        const root = makeFixtureRoot({
            'shell/Nav.tsx': 'const { meuToken } = design;',
            'appchrome/Chrome.tsx': "style.x = 'var(--meu-token-alias, 1px)';",
        });
        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: [] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        expect(checkChromeTokenParity({ root, tokens, groups })).toEqual([]);
    });

    it('ignora a pasta __tests__ — um teste que cita o token não é consumo', () => {
        const root = makeFixtureRoot({
            'shell/__tests__/Nav.test.tsx': 'const { meuToken } = design;',
            'appchrome/Chrome.tsx': "style.x = 'var(--meu-token-alias, 1px)';",
        });
        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: [] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        const missing = checkChromeTokenParity({ root, tokens, groups });
        expect(missing).toEqual([{ id: 'meuToken', semConsumidor: ['SarakShell'] }]);
    });

    it('extraFiles conta como consumo do grupo (o átomo compartilhado)', () => {
        const root = makeFixtureRoot({
            'shell/Nav.tsx': 'export const Nav = () => null;',
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
            'shared/Atom.tsx': 'const { meuToken } = design;',
        });
        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: ['shared/Atom.tsx'] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        const missing = checkChromeTokenParity({ root, tokens, groups });
        expect(missing).toEqual([{ id: 'meuToken', semConsumidor: ['SarakAppChrome'] }]);
    });

    it('MUTAÇÃO: retirar layoutPadding do Shell nomeia o SarakShell como lado faltante', () => {
        const root = makeFixtureRoot({
            'shell/ShellContent.tsx': 'export const ShellContent = () => null;',
            'appchrome/ChromeBody.tsx': "const padding = 'var(--sarak-layout-padding, 16px)';",
        });
        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: [] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        const tokens = [{ id: 'layoutPadding', cssVars: ['--sarak-layout-padding'] }];
        expect(checkChromeTokenParity({ root, tokens, groups })).toEqual([
            { id: 'layoutPadding', semConsumidor: ['SarakShell'] },
        ]);
    });

    it('MUTAÇÃO: retirar layoutPadding do AppChrome nomeia o SarakAppChrome como lado faltante', () => {
        const root = makeFixtureRoot({
            'shell/ShellContent.tsx': "const padding = 'var(--sarak-layout-padding, 16px)';",
            'appchrome/ChromeBody.tsx': 'export const ChromeBody = () => null;',
        });
        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: [] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        const tokens = [{ id: 'layoutPadding', cssVars: ['--sarak-layout-padding'] }];
        expect(checkChromeTokenParity({ root, tokens, groups })).toEqual([
            { id: 'layoutPadding', semConsumidor: ['SarakAppChrome'] },
        ]);
    });
});

describe('getChromeTokens (extração dinâmica do schema)', () => {
    it('PLANTADO: token novo no schema sem consumidor em NENHUM grupo — pego', () => {
        const root = makeFixtureRoot({
            'src/core/Design/schema/navigation.ts': `
                export const NavigationSchema = {
                    id: 'navigation',
                    tokens: [
                        {
                            id: 'meuTokenNovo',
                            type: 'select',
                            description: 'x',
                            constraints: { options: [{ id: 'a', value: 'a', label: 'A' }] },
                            defaultValue: 'a',
                            cssVars: ['--meu-token-novo'],
                        },
                        // comentário entre tokens não deve virar um objeto próprio
                        { id: 'semCssVars', type: 'text', description: 'y', defaultValue: 'z' },
                    ],
                };
            `,
            'src/core/Design/schema/system.ts': `
                export const SystemSchema = {
                    tokens: [
                        { id: 'isAutoHideEnabled', type: 'boolean', defaultValue: false },
                        { id: 'layoutPadding', type: 'slider', defaultValue: 16, cssVars: ['--sarak-layout-padding'] },
                    ],
                };
            `,
            'shell/Nav.tsx': 'export const Nav = () => null;',
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
        });
        const tokens = getChromeTokens({ root });
        expect(tokens.map((t) => t.id)).toEqual(['meuTokenNovo', 'semCssVars', 'isAutoHideEnabled', 'layoutPadding']);
        expect(tokens.find((t) => t.id === 'meuTokenNovo').cssVars).toEqual(['--meu-token-novo']);
        expect(tokens.find((t) => t.id === 'semCssVars').cssVars).toEqual([]);

        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: [] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        const missing = checkChromeTokenParity({ root, tokens, groups });
        expect(missing.map((m) => m.id).sort()).toEqual(['isAutoHideEnabled', 'layoutPadding', 'meuTokenNovo', 'semCssVars']);
    });

    it('DEIXA PASSAR: token novo com consumidor dos dois lados — liberado', () => {
        const root = makeFixtureRoot({
            'src/core/Design/schema/navigation.ts': `
                export const NavigationSchema = {
                    id: 'navigation',
                    tokens: [
                        { id: 'meuTokenNovo', type: 'text', description: 'x', defaultValue: 'y', cssVars: ['--meu-token-novo'] },
                    ],
                };
            `,
            'src/core/Design/schema/system.ts': `
                export const SystemSchema = {
                    tokens: [
                        { id: 'isAutoHideEnabled', type: 'boolean', defaultValue: false },
                        { id: 'layoutPadding', type: 'slider', defaultValue: 16, cssVars: ['--sarak-layout-padding'] },
                    ],
                };
            `,
            'shell/Nav.tsx': "style.x = 'var(--meu-token-novo, 1px)';",
            'appchrome/Chrome.tsx': 'const { meuTokenNovo } = design;',
        });
        const tokens = getChromeTokens({ root }).filter((t) => !['isAutoHideEnabled', 'layoutPadding'].includes(t.id));
        const groups = {
            SarakShell: { dirs: ['shell'], extraFiles: [] },
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
        };
        expect(checkChromeTokenParity({ root, tokens, groups })).toEqual([]);
    });

    it('lê toda a seção de layout e para antes da seção de bordas', () => {
        const root = makeFixtureRoot({
            'src/core/Design/schema/navigation.ts': "export const NavigationSchema = { tokens: [] };",
            'src/core/Design/schema/system.ts': `
                export const SystemSchema = {
                    tokens: [
                        { id: 'layoutPadding', type: 'slider', defaultValue: 16 },
                        // --- ARQUITETURA DE BORDAS ---
                        { id: 'borderRadius', type: 'slider', defaultValue: 8 },
                    ],
                };
            `,
        });
        expect(getChromeTokens({ root }).map((token) => token.id)).toEqual(['layoutPadding']);
    });
});

describe('check-chrome-token-parity — repositório real', () => {
    it('os tokens cobertos de navigation e layout têm consumidor no SarakShell E no SarakAppChrome', () => {
        const tokens = getChromeTokens().filter((t) => !ORPHAN_TOKENS.includes(t.id));
        expect(checkChromeTokenParity({ tokens })).toEqual([]);
    });

    it('declara somente a dívida de layout medida fora desta entrega (R18)', () => {
        expect(ORPHAN_TOKENS).toEqual(['layoutDensity', 'maxContentWidth', 'isSplitViewEnabled']);
    });
});
