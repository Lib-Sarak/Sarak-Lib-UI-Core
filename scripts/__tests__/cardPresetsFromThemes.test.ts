// @vitest-environment node
// O gerador dos presets de card por tema: o arquivo versionado é o que ele produz agora (o `--check` do `build`), o preset
// sai do tema e não de transcrição, e cada limite que a regra promete (sem cor, só a área do card, um por tema) tem a entrada
// exata e o resultado.
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { SARAK_ALL_THEMES } from '../../src/core/Design/presets/themes/all';
import type { SarakThemePreset } from '../../src/core/Design/presets/themes';
import { THEME_CARD_PRESETS } from '../../src/core/Design/presets/components/cardsThemes.generated';
import { MASTER_DESIGN_MAP, sarakGetAllDesignTokens } from '../../src/core/Design/master-map';
import { THEME_CARD_PRESET_PREFIX, buildThemeCardPreset, themeCardDesign } from '../cardPresetsFromThemes';

const withDesign = (design: Record<string, unknown>): SarakThemePreset => ({ ...SARAK_ALL_THEMES[0], design: { ...SARAK_ALL_THEMES[0].design, ...design } });

describe('presets de card gerados dos temas', () => {
    it('o arquivo versionado é exatamente o que o gerador produz dos temas de hoje', () => {
        expect(THEME_CARD_PRESETS).toEqual(SARAK_ALL_THEMES.map(buildThemeCardPreset));
    });

    it('um preset por tema embarcado, com o id derivado do id do tema', () => {
        expect(THEME_CARD_PRESETS.map((preset) => preset.id)).toEqual(SARAK_ALL_THEMES.map((theme) => `${THEME_CARD_PRESET_PREFIX}${theme.id}`));
    });

    it('o `--check` do gerador passa no repositório como está', () => {
        const run = spawnSync('npx', ['tsx', 'scripts/generate-theme-card-presets.ts', '--check'], { encoding: 'utf8', shell: true });
        expect({ status: run.status, out: run.stdout }).toEqual({ status: 0, out: expect.stringContaining('em dia') });
    }, 120000);

    it('mutação: um tema que muda um token de card muda o preset (o `--check` o acusaria)', () => {
        const before = buildThemeCardPreset(SARAK_ALL_THEMES[0]);
        const original = SARAK_ALL_THEMES[0].design.cardBorderWidth;
        const changed = buildThemeCardPreset(withDesign({ cardBorderWidth: Number(original) + 7 }));
        expect(changed.design.cardBorderWidth).toBe(Number(original) + 7);
        expect(JSON.stringify(changed)).not.toBe(JSON.stringify(before));
    });

    it('mutação: um tema que deixa de declarar um token de card o tira do preset', () => {
        const { cardBorderWidth: _removed, ...rest } = SARAK_ALL_THEMES[0].design;
        const preset = buildThemeCardPreset({ ...SARAK_ALL_THEMES[0], design: rest });
        expect('cardBorderWidth' in preset.design).toBe(false);
    });

    it('sem cor: token de cor e valor de texto com cor literal ficam de fora, e `none` fica', () => {
        const design = themeCardDesign(withDesign({ cardBackgroundColor: '#112233', cardShadow: '2px 2px 0 rgba(0,0,0,0.5)', cardHeaderBorder: '#ffffff' }));
        expect(design).not.toHaveProperty('cardBackgroundColor');
        expect(design).not.toHaveProperty('cardShadow');
        expect(design).not.toHaveProperty('cardHeaderBorder');
        expect(themeCardDesign(withDesign({ cardShadow: 'none' })).cardShadow).toBe('none');
    });

    it('sem cor em preset nenhum: nem token do tipo cor, nem literal de cor em texto', () => {
        const colors = new Set(sarakGetAllDesignTokens().filter((token) => token.type === 'color').map((token) => token.id));
        const offenders = THEME_CARD_PRESETS.flatMap((preset) => Object.entries(preset.design)
            .filter(([id, value]) => colors.has(id) || (typeof value === 'string' && /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/i.test(value)))
            .map(([id]) => `${preset.id}.${id}`));
        expect(offenders).toEqual([]);
    });

    it('só tokens da área do card: o que o tema declara de outra área não entra', () => {
        const design = themeCardDesign(withDesign({ sidebarWidth: 321, tableDensity: 'compact', cardBorderWidth: 2 }));
        expect(design).not.toHaveProperty('sidebarWidth');
        expect(design).not.toHaveProperty('tableDensity');
        expect(design.cardBorderWidth).toBe(2);
        const cardArea = new Set(MASTER_DESIGN_MAP.components.filter((schema) => ['cards', 'cardTitle', 'cardAction'].includes(schema.id)).flatMap((schema) => schema.tokens.map((token) => token.id)));
        expect(THEME_CARD_PRESETS.flatMap((preset) => Object.keys(preset.design).filter((id) => !cardArea.has(id)))).toEqual([]);
    });

    it('token que o tema não declara não vira `undefined` no preset', () => {
        const design = themeCardDesign(withDesign({ cardTextAlign: undefined }));
        expect(Object.values(design).filter((value) => value === undefined)).toEqual([]);
        expect(design).not.toHaveProperty('cardTextAlign');
    });
});
