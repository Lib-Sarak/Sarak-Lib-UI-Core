/**
 * O formato de escolhas (ADR-026): extrair do design só o que foi escolhido, refazer o design a partir das escolhas, e a
 * regra L1 para o design gravado no formato anterior.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { sarakLoadThemePreset } from '../../../Design/presets/themes/registry';
import { resolveThemeForMode, type ModeResolvableTheme } from '../../../Design/presets/themes/color-engine';
import { composeThemeDesign } from '../../../Design/presets/themes/compose';
import { resolveChosenPalette, resolvePaletteForDesign, PALETTE_CALCULATED_KEYS } from '../../../Design/palette/resolve';
import { validateDesign } from '../validation';
import {
    extractDesignChoices, findThemeEntry, normalizeLegacyDesign, recomposeDesignChoices, replaceDesignChoice,
} from '../designChoices';
import type { SarakThemeEntry } from '../../types';

type DesignRecord = Record<string, unknown>;

let sovereign: ModeResolvableTheme;
let highContrast: ModeResolvableTheme;

const asTheme = (entry: SarakThemeEntry): ModeResolvableTheme => ({ design: entry.design as never, contraparte: entry.contraparte });
const composed = (theme: ModeResolvableTheme, mode: 'light' | 'dark', host?: DesignRecord): DesignRecord =>
    validateDesign(composeThemeDesign(resolveThemeForMode(theme, mode) as DesignRecord, { mode }, host)) as unknown as DesignRecord;

beforeAll(async () => {
    sovereign = asTheme(await sarakLoadThemePreset('sarak-sovereign') as SarakThemeEntry);
    highContrast = asTheme(await sarakLoadThemePreset('high-contrast') as SarakThemeEntry);
});

describe('extractDesignChoices', () => {
    it('o tema composto no modo nativo não tem escolha nenhuma', () => {
        expect(extractDesignChoices(composed(sovereign, 'dark'), sovereign)).toEqual({});
    });

    it('o modo entra só quando difere do modo nativo do tema', () => {
        expect(extractDesignChoices(composed(sovereign, 'light'), sovereign)).toEqual({ mode: 'light' });
    });

    it('a cor ajustada à mão é escolha; a identidade do sistema também', () => {
        const design = { ...composed(sovereign, 'dark'), cardBorderColor: '#abcdef', systemName: 'ERP' };
        expect(extractDesignChoices(design, sovereign)).toEqual({ cardBorderColor: '#abcdef', systemName: 'ERP' });
    });

    it('a paleta escolhida grava só `colorPalette`, sem as cores que ela calcula', () => {
        const colors = resolveChosenPalette('amarelo-contraste', 'dark', { sidebarTone: 'neutral', topbarTone: 'neutral' });
        const design = { ...composed(sovereign, 'dark'), colorPalette: 'amarelo-contraste', ...colors };
        expect(extractDesignChoices(design, sovereign)).toEqual({ colorPalette: 'amarelo-contraste' });
    });

    it('o tom da barra é escolha, e a cor que ele calcula não', () => {
        const design = replaceDesignChoice(composed(sovereign, 'dark'), { sidebarTone: 'primary' }, sovereign) as unknown as DesignRecord;
        expect(extractDesignChoices(design, sovereign)).toEqual({ sidebarTone: 'primary' });
    });

    it('a cor que o host declara está no baseline e não é gravada', () => {
        const host = { primaryColor: '#123456' };
        expect(extractDesignChoices(composed(sovereign, 'dark', host), sovereign, host)).toEqual({});
    });
});

describe('recomposeDesignChoices', () => {
    it('ida e volta: o design refeito pelas escolhas é o design de onde elas saíram', () => {
        const colors = resolveChosenPalette('amarelo-contraste', 'dark', { sidebarTone: 'neutral', topbarTone: 'neutral' });
        const design: DesignRecord = { ...composed(sovereign, 'dark'), colorPalette: 'amarelo-contraste', ...colors, cardBorderColor: '#abcdef' };
        const back = validateDesign(recomposeDesignChoices(extractDesignChoices(design, sovereign), sovereign)) as unknown as DesignRecord;
        expect(Object.keys(design).filter((key) => JSON.stringify(back[key]) !== JSON.stringify(design[key]))).toEqual([]);
    });

    it('o tom escolhido muda a cor da barra para a que a paleta calcula com ele', () => {
        const design = recomposeDesignChoices({ topbarTone: 'inverse' }, sovereign) as unknown as DesignRecord;
        const expected = resolvePaletteForDesign({ ...resolveThemeForMode(sovereign, 'dark'), topbarTone: 'inverse' }, undefined, 'dark');
        expect(design.topbarColor).toBe(expected.topbarColor);
    });

    it('a cor da barra que o tema declara continua vencendo o tom', () => {
        const design = recomposeDesignChoices({ sidebarTone: 'primary' }, highContrast) as unknown as DesignRecord;
        expect(design.sidebarColor).toBe('#000000');
    });

    it('o tom escolhido vence o tom que o host declara', () => {
        const host = { sidebarTone: 'inverse' };
        const design = recomposeDesignChoices({ sidebarTone: 'surface' }, sovereign, host) as unknown as DesignRecord;
        const expected = resolvePaletteForDesign({ ...resolveThemeForMode(sovereign, 'dark'), sidebarTone: 'surface' }, undefined, 'dark');
        expect(design.sidebarColor).toBe(expected.sidebarColor);
    });
});

describe('baseline guardado entre chamadas', () => {
    it('o mesmo `design` com outra contraparte refaz o baseline pela contraparte nova', () => {
        expect(sovereign.contraparte).toBeDefined();
        const changed: ModeResolvableTheme = { design: sovereign.design, contraparte: { ...sovereign.contraparte, colorBgBody: '#fedcba' } };
        const before = recomposeDesignChoices({ mode: 'light' }, sovereign);
        const after = recomposeDesignChoices({ mode: 'light' }, changed);

        expect(before.colorBgBody).not.toBe('#fedcba');
        expect(after.colorBgBody).toBe('#fedcba');
    });

    it('o host entra pelo conteúdo: outro valor refaz o baseline, e o mesmo valor em outro objeto dá o mesmo design', () => {
        const first = recomposeDesignChoices({}, sovereign, { colorBgBody: '#111111' });
        const changed = recomposeDesignChoices({}, sovereign, { colorBgBody: '#222222' });
        const sameContent = recomposeDesignChoices({}, sovereign, { colorBgBody: '#111111' });

        expect(first.colorBgBody).toBe('#111111');
        expect(changed.colorBgBody).toBe('#222222');
        expect(sameContent).toEqual(first);
    });
});

describe('normalizeLegacyDesign — regra L1', () => {
    it('tira a cor calculada que o tema não declara (resto de outro tema) e mantém o resto do design', () => {
        const legacy = { ...composed(sovereign, 'dark'), colorBgBody: '#000000', sidebarColor: '#000000', bodySize: '18px' };
        const clean = composed(sovereign, 'dark');
        const fixed = validateDesign(normalizeLegacyDesign(legacy, sovereign)) as unknown as DesignRecord;
        expect(fixed.colorBgBody).toBe(clean.colorBgBody);
        expect(fixed.sidebarColor).toBe(clean.sidebarColor);
        expect(fixed.bodySize).toBe('18px');
    });

    it('mantém a cor calculada que o tema ou o host declaram', () => {
        const legacy = { ...composed(highContrast, 'dark'), sidebarColor: '#111111', colorBgBody: '#222222' };
        const host = { colorBgBody: '#222222' };
        const fixed = normalizeLegacyDesign(legacy, highContrast, host) as unknown as DesignRecord;
        expect(fixed.sidebarColor).toBe('#111111');
        expect(fixed.colorBgBody).toBe('#222222');
    });

    it('sem paleta válida nada é calculado, e o design fica como está', () => {
        const legacy = { primaryColor: '#123456', colorPalette: '' };
        expect(normalizeLegacyDesign(legacy, sovereign)).toBe(legacy);
    });

    it('a lista de chaves calculadas cobre os papéis de cada tom da barra', () => {
        expect(PALETTE_CALCULATED_KEYS.has('colorBgBody')).toBe(true);
        expect(PALETTE_CALCULATED_KEYS.has('topbarTitleColor')).toBe(true);
        expect(PALETTE_CALCULATED_KEYS.has('bodySize')).toBe(false);
    });
});

describe('findThemeEntry', () => {
    it('acha o tema do consumidor com design, e o embarcado em memória; sem id ou sem tema, nada', () => {
        const custom = [{ id: 'meu', name: 'Meu', design: { mode: 'light' } }] as SarakThemeEntry[];
        expect(findThemeEntry(custom, 'meu')?.design).toEqual({ mode: 'light' });
        expect(findThemeEntry(undefined, 'sarak-sovereign')).toBeDefined();
        expect(findThemeEntry(custom, 'nao-existe')).toBeUndefined();
        expect(findThemeEntry(custom, undefined)).toBeUndefined();
    });
});
