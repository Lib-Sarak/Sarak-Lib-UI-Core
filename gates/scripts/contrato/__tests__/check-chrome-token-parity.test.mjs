// @vitest-environment node
// Teste do PRÓPRIO GATE (plan-66): os 12 tokens de cromo do painel (`sidebarPosition`,
// `sidebarHoverColor`, etc.) tinham consumidor no `SarakShell` mas nenhum no
// `SarakAppChrome` — o painel confirmava a mudança, a tela do modo ui-kit não reagia.
// Casos PLANTADOS que o gate PEGA (token sem consumidor num lado, nos dois) e os que
// ele DEIXA PASSAR (token referenciado pelo `id`, por `cssVars` ou pelo auto-derivado
// `--sarak-<kebab>`, no átomo compartilhado) — e, por fim, o repositório real.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it, afterEach } from 'vitest';
import { CHROME_TOKENS, checkChromeTokenParity, tokenHasConsumer } from '../check-chrome-token-parity.mjs';

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
});

describe('check-chrome-token-parity — repositório real', () => {
    it('os 14 tokens de cromo cobertos têm consumidor no SarakShell E no SarakAppChrome', () => {
        expect(checkChromeTokenParity()).toEqual([]);
    });

    it('a lista fechada tem exatamente os 14 tokens com consumidor provado', () => {
        expect(CHROME_TOKENS.map((t) => t.id).sort()).toEqual(
            [
                'contentAlignment', 'isAutoHideEnabled', 'isNavHidden', 'navbarLayout',
                'navItemActiveColor', 'searchPositionSidebar', 'searchPositionTopbar',
                'sidebarActiveColor', 'sidebarHoverColor', 'sidebarPosition', 'tabGap',
                'tabSectionMargin', 'topbarActiveColor', 'topbarHoverColor',
            ].sort(),
        );
    });
});
