// @vitest-environment node
// Teste do PRÓPRIO GATE `theme-completeness:check`: casos plantados que ele PEGA (estético ausente no modo
// principal, estético que carrega modo ausente na contraparte, contraparte ausente, funcional declarado no tema ou na
// contraparte, estético fixo declarado na contraparte, exceção obsoleta) e os que ele DEIXA PASSAR (tema completo,
// `mode` e chave de payload na contraparte/no design, tema em exceção), mais a mutação sobre o dicionário real:
// um tema sintético completo passa, e tirar dele uma chave estética obrigatória derruba o gate.
import { describe, expect, it } from 'vitest';
import { MASTER_DESIGN_MAP } from '../../../../src/core/Design/master-map';
import { SARAK_ALL_THEMES } from '../../../../src/core/Design/presets/themes/all';
import { PALETTE_ROLE_MAP } from '../../../../src/core/Design/palette/role-map';
import { buildReport, readPending } from '../check-theme-completeness';
import {
    buildCompletenessReport,
    gapsOfTheme,
    type CompletenessThemeLike,
    type CompletenessTokenLike,
} from '../helpers/theme-completeness-core';

const tokens: CompletenessTokenLike[] = [
    { id: 'mode', kind: 'aesthetic', modeDependent: false },
    { id: 'primaryColor', kind: 'aesthetic', modeDependent: true },
    { id: 'borderRadius', kind: 'aesthetic', modeDependent: false },
    { id: 'colorPalette', kind: 'aesthetic', modeDependent: false },
    { id: 'sidebarWidth', kind: 'functional', modeDependent: false },
    { id: 'semKind' },
];

const complete: CompletenessThemeLike = {
    id: 'complete-theme',
    design: { mode: 'dark', primaryColor: '#fff', borderRadius: 8, colorPalette: '' },
    contraparte: { mode: 'light', primaryColor: '#000' },
};

const reasonsOf = (theme: CompletenessThemeLike): string[] => gapsOfTheme(theme, tokens).map((gap) => `${gap.reason}:${gap.tokenId}`);
const realTokens = MASTER_DESIGN_MAP.components.flatMap((component) => component.tokens);
const paletteTokenIds = new Set(Object.keys(PALETTE_ROLE_MAP));

/** Tema sintético completo derivado do dicionário: todo estético obrigatório no principal e na contraparte. */
const syntheticComplete = (): CompletenessThemeLike => {
    const aesthetic = realTokens.filter((token) => token.kind === 'aesthetic');
    return {
        id: 'synthetic',
        design: Object.fromEntries(aesthetic.map((token) => [token.id, token.defaultValue])),
        contraparte: { mode: 'light', ...Object.fromEntries(aesthetic.filter((token) => token.modeDependent).map((token) => [token.id, token.defaultValue])) },
    };
};

describe('theme-completeness:check — temas válidos e tokens opcionais', () => {
    it('deixa passar o tema completo (inclusive `mode` na contraparte e chave que não é token)', () => {
        expect(reasonsOf(complete)).toEqual([]);
        const withPayloadKeys = { ...complete, design: { ...complete.design, enabledLanguages: ['pt'], semKind: 'x' } };
        expect(reasonsOf(withPayloadKeys)).toEqual([]);
    });

    it('exige a declaração de `colorPalette`: o tema embarcado declara todo token estético', () => {
        expect(reasonsOf({ ...complete, design: { mode: 'dark', primaryColor: '#fff', borderRadius: 8 } })).toEqual(['missing-aesthetic:colorPalette']);
    });
});

describe('theme-completeness:check — o tema que declara paleta', () => {
    const paletteTokens = new Set(['primaryColor']);
    const withPalette: CompletenessThemeLike = {
        id: 'palette-theme',
        design: { mode: 'dark', borderRadius: 8, colorPalette: 'oceano' },
        contraparte: { mode: 'light' },
    };
    const paletteReasons = (theme: CompletenessThemeLike): string[] =>
        gapsOfTheme(theme, tokens, paletteTokens).map((gap) => `${gap.reason}:${gap.tokenId}`);

    it('deixa passar o tema com paleta que não declara a cor que ela calcula, no design nem na contraparte', () => {
        expect(paletteReasons(withPalette)).toEqual([]);
    });

    it('continua cobrando a cor do tema SEM paleta (e do tema com a paleta vazia)', () => {
        const withoutPalette = { ...withPalette, design: { mode: 'dark', borderRadius: 8, colorPalette: '' } };
        expect(paletteReasons(withoutPalette)).toEqual(['missing-aesthetic:primaryColor', 'missing-mode-aesthetic:primaryColor']);
    });

    it('cobra o que a paleta NÃO calcula: o estético fora do mapa segue obrigatório', () => {
        expect(paletteReasons({ ...withPalette, design: { mode: 'dark', colorPalette: 'oceano' } })).toEqual(['missing-aesthetic:borderRadius']);
    });

    it('aceita a sobrescrita mantida nos dois blocos e acusa a que vaza para o outro modo', () => {
        const kept = { ...withPalette, design: { ...withPalette.design, primaryColor: '#fff' }, contraparte: { mode: 'light', primaryColor: '#000' } };
        expect(paletteReasons(kept)).toEqual([]);
        const leaking = { ...kept, contraparte: { mode: 'light' } };
        expect(paletteReasons(leaking)).toEqual(['palette-override-missing-in-contraparte:primaryColor']);
    });
});

describe('theme-completeness:check — lacunas obrigatórias', () => {
    it('pega o estético ausente no modo principal, inclusive o que vale `undefined`', () => {
        expect(reasonsOf({ ...complete, design: { mode: 'dark', primaryColor: '#fff', colorPalette: '' } })).toEqual(['missing-aesthetic:borderRadius']);
        expect(reasonsOf({ ...complete, design: { ...complete.design, borderRadius: undefined } })).toEqual(['missing-aesthetic:borderRadius']);
    });

    it('conta `0`, `false`, `null` e `""` como declarados', () => {
        for (const value of [0, false, null, '']) {
            expect(reasonsOf({ ...complete, design: { ...complete.design, borderRadius: value } })).toEqual([]);
        }
    });
    it('pega o estético que carrega modo ausente na contraparte, e a contraparte ausente', () => {
        expect(reasonsOf({ ...complete, contraparte: { mode: 'light' } })).toEqual(['missing-mode-aesthetic:primaryColor']);
        expect(reasonsOf({ id: 'no-pair', design: complete.design })).toEqual(['contraparte-missing:(contraparte)']);
    });

    it('pega o funcional declarado no tema e na contraparte', () => {
        expect(reasonsOf({ ...complete, design: { ...complete.design, sidebarWidth: 240 } })).toEqual(['declares-functional:sidebarWidth']);
        expect(reasonsOf({ ...complete, contraparte: { ...complete.contraparte, sidebarWidth: 240 } })).toEqual([
            'contraparte-declares-functional:sidebarWidth',
        ]);
    });

    it('pega o estético que não carrega modo declarado na contraparte (a identidade vem do modo principal)', () => {
        expect(reasonsOf({ ...complete, contraparte: { ...complete.contraparte, borderRadius: 0 } })).toEqual([
            'contraparte-declares-fixed-aesthetic:borderRadius',
        ]);
    });
});

describe('theme-completeness:check — exceções', () => {
    it('deixa passar o tema em exceção e acusa a exceção obsoleta (tema completo ou inexistente)', () => {
        const incomplete: CompletenessThemeLike = { id: 'old-theme', design: {} };
        expect(buildCompletenessReport([incomplete], tokens, { 'old-theme': 7 }).gaps).toEqual([]);
        expect(buildCompletenessReport([complete], tokens, { 'complete-theme': 7 }).staleExceptions).toEqual(['complete-theme']);
        expect(buildCompletenessReport([complete], tokens, { fantasma: 7 }).staleExceptions).toEqual(['fantasma']);
    });

    it('conta temas completos, em exceção e o total', () => {
        const incomplete: CompletenessThemeLike = { id: 'old-theme', design: {} };
        const report = buildCompletenessReport([complete, incomplete], tokens, { 'old-theme': 7 });
        expect([report.complete, report.excepted, report.total]).toEqual([1, 1, 2]);
    });
});

describe('theme-completeness:check — o dicionário e os temas reais', () => {
    it('o repositório passa: nenhuma lacuna fora da exceção e nenhuma exceção obsoleta', () => {
        const report = buildReport();
        expect(report.gaps).toEqual([]);
        expect(report.staleExceptions).toEqual([]);
    });

    it('a lista de exceção só tem tema que existe', () => {
        const ids = new Set(SARAK_ALL_THEMES.map((theme) => theme.id));
        for (const id of Object.keys(readPending())) expect(ids.has(id)).toBe(true);
    });

    it('tema que está na lista de exceção tem lacuna; tema que não está tem de estar completo', () => {
        const pending = readPending();
        for (const theme of SARAK_ALL_THEMES) {
            const gaps = gapsOfTheme({ id: theme.id, design: theme.design, contraparte: theme.contraparte }, realTokens, paletteTokenIds);
            if (theme.id in pending) expect(gaps.length).toBeGreaterThan(0);
            else expect(gaps).toEqual([]);
        }
    });

    it('o tema sintético completo passa sem exceção (a régua não acusa o que está certo)', () => {
        expect(gapsOfTheme(syntheticComplete(), realTokens)).toEqual([]);
    });
});

describe('theme-completeness:check — mutações no dicionário', () => {
    it('MUTAÇÃO: tirar um estético do modo principal derruba o gate', () => {
        const theme = syntheticComplete();
        const { cardBorderRadius: _removed, ...design } = theme.design;
        const report = buildCompletenessReport([{ ...theme, design }], realTokens, {});
        expect(report.gaps.map((gap) => `${gap.reason}:${gap.tokenId}`)).toEqual(['missing-aesthetic:cardBorderRadius']);
    });

    it('MUTAÇÃO: tirar da contraparte um estético que carrega modo derruba o gate', () => {
        const theme = syntheticComplete();
        const { cardBackgroundColor: _removed, ...contraparte } = theme.contraparte!;
        const report = buildCompletenessReport([{ ...theme, contraparte }], realTokens, {});
        expect(report.gaps.map((gap) => `${gap.reason}:${gap.tokenId}`)).toEqual(['missing-mode-aesthetic:cardBackgroundColor']);
    });

    it('MUTAÇÃO: declarar um funcional do dicionário real no tema derruba o gate', () => {
        const theme = syntheticComplete();
        const report = buildCompletenessReport([{ ...theme, design: { ...theme.design, sidebarWidth: 240 } }], realTokens, {});
        expect(report.gaps.map((gap) => `${gap.reason}:${gap.tokenId}`)).toEqual(['declares-functional:sidebarWidth']);
    });
});
