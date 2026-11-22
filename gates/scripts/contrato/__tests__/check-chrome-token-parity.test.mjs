// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { NavigationSchema } from '../../../../src/core/Design/schema/navigation';
import {
    CONSUMER_GROUPS,
    GENERIC_READERS,
    NOT_CHROME_TOKENS,
    staleReaders,
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
        expect(ORPHAN_TOKENS).toEqual([]);
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

    it('MUTAÇÃO: token de navegação em global.ts sem consumidor reprova', () => {
        const root = createFixtureRoot({
            'src/core/Design/schema/navigation.ts': 'export const NavigationSchema = { tokens: [] };',
            'src/core/Design/schema/system.ts': 'export const SystemSchema = { tokens: [ // --- ARQUITETURA DE BORDAS --- ] };',
            'src/core/Design/schema/global.ts': [
                'export const GlobalSchema = {',
                '    tokens: [',
                "        { id: 'mobileNavigationStyle', defaultValue: 'drawer' },",
                "        { id: 'bodySize', defaultValue: '14px' },",
                '    ],',
                '};',
            ].join('\n'),
            'appchrome/Chrome.tsx': 'export const Chrome = () => null;',
        });
        const tokens = getChromeTokens({ root });

        expect(tokens.map((token) => token.id)).toEqual(['mobileNavigationStyle']);
        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([
            { id: 'mobileNavigationStyle', semConsumidor: ['SarakAppChrome'] },
        ]);
    });
});

describe('getChromeTokens — token que a leitura de texto não enxergava', () => {
    const systemEmpty = 'export const SystemSchema = { tokens: [ // --- ARQUITETURA DE BORDAS --- ] };';
    const chromeEmpty = 'export const Chrome = () => null;';
    const navigationWith = (imports, tokens) => [
        imports,
        "const make = (id: string) => ({ id, type: 'select', defaultValue: 'a', cssVars: ['--sarak-' + id] });",
        'export const NavigationSchema = {',
        '    tokens: [',
        tokens,
        '    ],',
        '};',
    ].join('\n');

    it('extrai os mesmos ids do schema importado (todo o navigation.ts, o de fábrica e o de barPersonality incluídos)', () => {
        const extracted = new Set(getChromeTokens().map((token) => token.id));
        const imported = NavigationSchema.tokens.map((token) => token.id);

        expect(imported.length).toBeGreaterThan(70);
        expect(imported.filter((id) => !extracted.has(id))).toEqual([]);
    });

    it('MUTAÇÃO: token de fábrica sem consumidor reprova', () => {
        const root = createFixtureRoot({
            'src/core/Design/schema/system.ts': systemEmpty,
            'src/core/Design/schema/navigation.ts': navigationWith('', "        make('tokenDeFabrica'),"),
            'appchrome/Chrome.tsx': chromeEmpty,
        });
        const tokens = getChromeTokens({ root });

        expect(tokens.map((token) => token.id)).toEqual(['tokenDeFabrica']);
        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([
            { id: 'tokenDeFabrica', semConsumidor: ['SarakAppChrome'] },
        ]);
    });

    it('MUTAÇÃO: token em barPersonality.ts sem consumidor reprova', () => {
        const root = createFixtureRoot({
            'src/core/Design/schema/system.ts': systemEmpty,
            'src/core/Design/schema/barPersonality.ts': "export const BarPersonalitySchema = { tokens: [{ id: 'tokenDaPersonalidade', cssVars: [] }] };",
            'src/core/Design/schema/navigation.ts': navigationWith("import { BarPersonalitySchema } from './barPersonality';", '        ...BarPersonalitySchema.tokens,'),
            'appchrome/Chrome.tsx': chromeEmpty,
        });
        const tokens = getChromeTokens({ root });

        expect(tokens.map((token) => token.id)).toEqual(['tokenDaPersonalidade']);
        expect(checkChromeTokenParity({ root, tokens, groups: appChromeGroup })).toEqual([
            { id: 'tokenDaPersonalidade', semConsumidor: ['SarakAppChrome'] },
        ]);
    });

    it('token lido por mapa de ids exportado do schema só conta como consumido se o cromo lê a chave dele no mapa', () => {
        const files = {
            'src/core/Design/schema/navigation.ts': 'export const NavigationSchema = { tokens: [] };',
            'src/core/Design/schema/system.ts': systemEmpty,
            'src/core/Design/schema/preferences.ts': [
                "export const POSITION_IDS = { navigationStyle: 'preferenceNavigationStylePosition' };",
                "export const PreferencesSchema = { tokens: [{ id: 'preferenceNavigationStylePosition' }] };",
            ].join('\n'),
        };
        const without = createFixtureRoot({ ...files, 'appchrome/Chrome.tsx': chromeEmpty });
        const withMap = createFixtureRoot({ ...files, 'appchrome/Chrome.tsx': 'const id = POSITION_IDS.navigationStyle;' });

        expect(checkChromeTokenParity({ root: without, tokens: getChromeTokens({ root: without }), groups: appChromeGroup })).toHaveLength(1);
        expect(checkChromeTokenParity({ root: withMap, tokens: getChromeTokens({ root: withMap }), groups: appChromeGroup })).toEqual([]);
    });
});

describe('getChromeTokens — mapa de ids, fábrica em system.ts e posição de preferência', () => {
    const navigationEmpty = 'export const NavigationSchema = { tokens: [] };';
    const chrome = (content) => ({ 'appchrome/Chrome.tsx': content });
    const preferences = [
        "export const POSITION_IDS = { colorMode: 'preferenceModePosition', language: 'preferenceLanguagePosition' };",
        'export const PreferencesSchema = { tokens: [',
        "    { id: 'preferenceModePosition' }, { id: 'preferenceLanguagePosition' }, { id: 'preferenceFontSizeReduction' },",
        '] };',
    ].join('\n');
    const run = (files, readers = []) => {
        const root = createFixtureRoot(files);
        return checkChromeTokenParity({ root, tokens: getChromeTokens({ root }), groups: appChromeGroup, readers }).map((entry) => entry.id);
    };
    const base = {
        'src/core/Design/schema/navigation.ts': navigationEmpty,
        'src/core/Design/schema/system.ts': 'export const SystemSchema = { tokens: [] };',
    };

    it('MUTAÇÃO: id inventado no mapa reprova, mesmo com outra chave do mapa lida pelo cromo', () => {
        const withInvented = preferences.replace("language: 'preferenceLanguagePosition' }", "language: 'preferenceLanguagePosition', invented: 'tokenInventado' }")
            .replace("{ id: 'preferenceFontSizeReduction' },", "{ id: 'tokenInventado' },");

        expect(run({ ...base, 'src/core/Design/schema/preferences.ts': withInvented, ...chrome('const a = POSITION_IDS.colorMode; const b = POSITION_IDS.language;') }))
            .toEqual(['tokenInventado']);
    });

    it('MUTAÇÃO: posição de preferência sem leitor reprova; com a chave lida ou o leitor declarado e chamado, passa', () => {
        const files = { ...base, 'src/core/Design/schema/preferences.ts': preferences };
        const readers = [{ name: 'readAllPositions', reads: 'POSITION_IDS' }];

        expect(run({ ...files, ...chrome('export const Chrome = () => null;') }, readers)).toEqual(['preferenceModePosition', 'preferenceLanguagePosition']);
        expect(run({ ...files, ...chrome('const a = POSITION_IDS.colorMode; const b = POSITION_IDS["language"];') }, readers)).toEqual([]);
        expect(run({ ...files, ...chrome('readAllPositions(design);') }, readers)).toEqual([]);
        expect(run({ ...files, ...chrome('const unused = readAllPositions;') }, readers)).toHaveLength(2);
    });

    it('os passos de tamanho de fonte ficam fora, com o motivo escrito', () => {
        const root = createFixtureRoot({ ...base, 'src/core/Design/schema/preferences.ts': preferences, ...chrome('') });

        expect(getChromeTokens({ root }).map((token) => token.id)).not.toContain('preferenceFontSizeReduction');
        expect(NOT_CHROME_TOKENS.preferenceFontSizeReduction).toMatch(/overlayPreferences/);
    });

    it('MUTAÇÃO: token de fábrica em system.ts, antes do marcador de bordas, reprova; depois dele fica fora', () => {
        const system = [
            "const make = (id: string) => ({ id, cssVars: ['--x-' + id] });",
            'export const SystemSchema = { tokens: [',
            "    make('layoutDeFabrica'),",
            '    // --- ARQUITETURA DE BORDAS ---',
            "    { id: 'borderRadius' },",
            "    make('bordaDeFabrica'),",
            '] };',
        ].join('\n');

        expect(run({ 'src/core/Design/schema/navigation.ts': navigationEmpty, 'src/core/Design/schema/system.ts': system, ...chrome('') }))
            .toEqual(['layoutDeFabrica']);
    });

    it('o leitor declarado existe em src/ (a declaração obsoleta é acusada)', () => {
        const root = createFixtureRoot({ 'src/core/Provider/reader.ts': 'export const readAllPositions = () => null;' });

        expect(staleReaders({ root, readers: [{ name: 'readAllPositions', reads: 'X' }, { name: 'sumiu', reads: 'X' }] })).toEqual([{ name: 'sumiu', reads: 'X' }]);
        expect(staleReaders()).toEqual([]);
        expect(GENERIC_READERS.map((reader) => reader.name)).toContain('splitChromeWidgetsByPlacement');
    });
});
