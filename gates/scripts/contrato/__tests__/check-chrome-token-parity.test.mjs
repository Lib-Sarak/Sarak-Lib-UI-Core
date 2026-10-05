// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
    CONSUMER_GROUPS,
    ORPHAN_TOKENS,
    checkChromeTokenParity,
    getChromeTokens,
    tokenHasConsumer,
} from '../check-chrome-token-parity.mjs';

const fixtureRoots = [];

function createFixtureRoot(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-chrome-token-parity-'));
    fixtureRoots.push(root);
    for (const [relativePath, content] of Object.entries(files)) {
        const fullPath = path.join(root, relativePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf8');
    }
    return root;
}

const appChromeGroup = {
    SarakAppChrome: { dirs: ['appchrome'], extraFiles: [] },
};

afterEach(() => {
    while (fixtureRoots.length) fs.rmSync(fixtureRoots.pop(), { recursive: true, force: true });
});

describe('tokenHasConsumer', () => {
    const token = { id: 'sidebarPosition', cssVars: ['--theme-sidebar-position'] };

    it('reconhece o id do schema por desestruturação', () => {
        expect(tokenHasConsumer(token, 'const { sidebarPosition } = design;')).toBe(true);
    });

    it('reconhece a variável automática derivada do id', () => {
        expect(tokenHasConsumer(token, "style.left = 'var(--sarak-sidebar-position, left)';")).toBe(true);
    });

    it('reconhece uma variável CSS declarada no schema', () => {
        expect(tokenHasConsumer(token, "style.left = 'var(--theme-sidebar-position)';")).toBe(true);
    });

    it('não trata um id que é parte de outro identificador como consumo', () => {
        expect(tokenHasConsumer(token, 'const sidebarPositionX = 1;')).toBe(false);
    });

    it('não trata conteúdo sem id ou variável CSS como consumo', () => {
        expect(tokenHasConsumer(token, 'export const value = 1;')).toBe(false);
    });
});

describe('checkChromeTokenParity', () => {
    it('verifica somente o grupo SarakAppChrome', () => {
        expect(Object.keys(CONSUMER_GROUPS)).toEqual(['SarakAppChrome']);
    });

    it('MUTAÇÃO: token sem consumidor aponta o único grupo faltante', () => {
        const root = createFixtureRoot({
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
        });
        const tokens = [{ id: 'sampleNavigationToken', cssVars: ['--sample-navigation-token'] }];

        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([
            { id: 'sampleNavigationToken', semConsumidor: ['SarakAppChrome'] },
        ]);
    });

    it('MUTAÇÃO: layoutPadding removido do cromo é apontado como ausente', () => {
        const root = createFixtureRoot({
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
        });
        const tokens = [{ id: 'layoutPadding', cssVars: ['--sarak-layout-padding'] }];

        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([
            { id: 'layoutPadding', semConsumidor: ['SarakAppChrome'] },
        ]);
    });

    it('aceita o token consumido pelo SarakAppChrome', () => {
        const root = createFixtureRoot({
            'appchrome/Chrome.tsx': "const gap = 'var(--sample-navigation-token)';",
        });
        const tokens = [{ id: 'sampleNavigationToken', cssVars: ['--sample-navigation-token'] }];

        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([]);
    });

    it('ignora referências em __tests__ ao verificar o consumidor', () => {
        const root = createFixtureRoot({
            'appchrome/__tests__/Chrome.test.tsx': 'const { sidebarPosition } = design;',
        });
        const tokens = [{ id: 'sidebarPosition', cssVars: [] }];

        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([
            { id: 'sidebarPosition', semConsumidor: ['SarakAppChrome'] },
        ]);
    });

    it('conta extraFiles como parte do consumidor do grupo', () => {
        const root = createFixtureRoot({
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
            'shared/Shared.tsx': 'const { sidebarPosition } = design;',
        });
        const groups = {
            SarakAppChrome: { dirs: ['appchrome'], extraFiles: ['shared/Shared.tsx'] },
        };
        const tokens = [{ id: 'sidebarPosition', cssVars: [] }];

        expect(checkChromeTokenParity({ root, tokens, groups })).toEqual([]);
    });

    it('mantém a lista de órfãos e verifica os tokens cobertos no repositório', () => {
        expect(ORPHAN_TOKENS).toEqual(['layoutDensity', 'maxContentWidth', 'isSplitViewEnabled']);
        const coveredTokens = getChromeTokens().filter((token) => !ORPHAN_TOKENS.includes(token.id));

        expect(checkChromeTokenParity({ tokens: coveredTokens })).toEqual([]);
    });
});

describe('getChromeTokens — extração dinâmica do schema', () => {
    it('pega tokens novos sem consumidor no grupo SarakAppChrome', () => {
        const root = createFixtureRoot({
            'src/core/Design/schema/navigation.ts': [
                'export const NavigationSchema = {',
                '    tokens: [',
                "        { id: 'meuTokenNovo', type: 'select', defaultValue: 'a', cssVars: ['--meu-token-novo'] },",
                '        // comentário entre tokens não vira um token',
                "        { id: 'semCssVars', type: 'text', defaultValue: 'z' },",
                '    ],',
                '};',
            ].join('\n'),
            'src/core/Design/schema/system.ts': [
                'export const SystemSchema = {',
                '    tokens: [',
                "        { id: 'isAutoHideEnabled', type: 'boolean', defaultValue: false },",
                "        { id: 'layoutPadding', type: 'slider', defaultValue: 16, cssVars: ['--sarak-layout-padding'] },",
                '    ],',
                '};',
            ].join('\n'),
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
        });
        const tokens = getChromeTokens({ root });

        expect(tokens.map((token) => token.id)).toEqual([
            'meuTokenNovo',
            'semCssVars',
            'isAutoHideEnabled',
            'layoutPadding',
        ]);
        expect(tokens.find((token) => token.id === 'meuTokenNovo')?.cssVars).toEqual(['--meu-token-novo']);
        expect(tokens.find((token) => token.id === 'semCssVars')?.cssVars).toEqual([]);
        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([
            { id: 'meuTokenNovo', semConsumidor: ['SarakAppChrome'] },
            { id: 'semCssVars', semConsumidor: ['SarakAppChrome'] },
            { id: 'isAutoHideEnabled', semConsumidor: ['SarakAppChrome'] },
            { id: 'layoutPadding', semConsumidor: ['SarakAppChrome'] },
        ]);
    });

    it('libera token novo do schema quando o SarakAppChrome o consome', () => {
        const root = createFixtureRoot({
            'src/core/Design/schema/navigation.ts': [
                'export const NavigationSchema = {',
                '    tokens: [',
                "        { id: 'meuTokenNovo', type: 'text', defaultValue: 'y', cssVars: ['--meu-token-novo'] },",
                '    ],',
                '};',
            ].join('\n'),
            'src/core/Design/schema/system.ts': [
                'export const SystemSchema = { tokens: [',
                "    { id: 'layoutPadding', type: 'slider', defaultValue: 16 },",
                '] };',
            ].join('\n'),
            'appchrome/Chrome.tsx': "const gap = 'var(--meu-token-novo)';",
        });
        const tokens = getChromeTokens({ root }).filter((token) => token.id === 'meuTokenNovo');

        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([]);
    });

    it('lê a seção de layout e para antes da seção de bordas', () => {
        const root = createFixtureRoot({
            'src/core/Design/schema/navigation.ts': 'export const NavigationSchema = { tokens: [] };',
            'src/core/Design/schema/system.ts': [
                'export const SystemSchema = {',
                '    tokens: [',
                "        { id: 'layoutPadding', type: 'slider', defaultValue: 16 },",
                '        // --- ARQUITETURA DE BORDAS ---',
                "        { id: 'borderRadius', type: 'slider', defaultValue: 8 },",
                '    ],',
                '};',
            ].join('\n'),
        });

        expect(getChromeTokens({ root }).map((token) => token.id)).toEqual(['layoutPadding']);
    });
});
