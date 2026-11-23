// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PALETTE_ROLE_MAP } from '../../../palette/role-map';
import { resolveChosenPalette } from '../../../palette/resolve';
import { SARAK_ALL_THEMES } from '../all';
import { composeThemeDesign } from '../compose';
import { resolveThemeForMode } from '../color-engine';
import type { SarakTokenValue } from '../../../types';

type DesignRecord = Record<string, unknown>;

const CHOSEN = 'custom:triadic:#d11a5f';
const ROLE_IDS = Object.keys(PALETTE_ROLE_MAP);

const resolved = (theme: (typeof SARAK_ALL_THEMES)[number], mode: 'light' | 'dark'): DesignRecord =>
    resolveThemeForMode({
        design: theme.design as Record<string, SarakTokenValue>,
        ...(theme.contraparte ? { contraparte: theme.contraparte } : {}),
    }, mode) as DesignRecord;

const modeOf = (theme: (typeof SARAK_ALL_THEMES)[number]): 'light' | 'dark' => (theme.design.mode === 'light' ? 'light' : 'dark');

/** Os papéis de cor que o tema declara por cima da paleta dele. */
const declaredRoles = (theme: DesignRecord): string[] => ROLE_IDS.filter((id) => id in theme);

describe('escolher um tema aplica as cores dele (padrão, "manter minha paleta" desligado)', () => {
    it.each(SARAK_ALL_THEMES.map((theme) => [theme.id, theme] as const))('%s: a paleta que declara e as cores que declara vencem a paleta escolhida antes', (_id, theme) => {
        const mode = modeOf(theme);
        const theResolved = resolved(theme, mode);
        const previous = { mode, colorPalette: CHOSEN, ...resolveChosenPalette(CHOSEN, mode) };

        const design = composeThemeDesign(theResolved, previous) as unknown as DesignRecord;

        expect(design.colorPalette).toBe(theResolved.colorPalette);
        expect(design.keepPalette).toBe(false);
        declaredRoles(theResolved).forEach((id) => expect(design[id], `${theme.id}.${id}`).toBe(theResolved[id]));
    });
});

describe('"manter minha paleta" ligado: a paleta escolhida vale por cima de qualquer tema', () => {
    const withRoles = SARAK_ALL_THEMES.filter((theme) => declaredRoles(resolved(theme, modeOf(theme))).length > 0);

    it('há temas de cor declarada para o teste exercitar', () => {
        expect(withRoles.length).toBeGreaterThan(0);
    });

    it.each(SARAK_ALL_THEMES.map((theme) => [theme.id, theme] as const))('%s: ganha a paleta escolhida em todo papel que ela calcula, inclusive os que o tema declara', (_id, theme) => {
        const mode = modeOf(theme);
        const previous = { mode, keepPalette: true, colorPalette: CHOSEN };

        const design = composeThemeDesign(resolved(theme, mode), previous) as unknown as DesignRecord;

        expect(design.colorPalette).toBe(CHOSEN);
        expect(design.keepPalette).toBe(true);
        const tones = { sidebarTone: design.sidebarTone, topbarTone: design.topbarTone };
        Object.entries(resolveChosenPalette(CHOSEN, mode, tones)).forEach(([id, color]) => expect(design[id], `${theme.id}.${id}`).toBe(color));
    });

    it('trocar de novo, para outro tema, mantém a paleta', () => {
        const [first, second] = withRoles;
        const afterFirst = composeThemeDesign(resolved(first, modeOf(first)), { mode: modeOf(first), keepPalette: true, colorPalette: CHOSEN });
        const afterSecond = composeThemeDesign(resolved(second, modeOf(first)), afterFirst) as unknown as DesignRecord;

        expect(afterSecond.colorPalette).toBe(CHOSEN);
        expect(afterSecond.keepPalette).toBe(true);
        const mode = afterSecond.mode === 'light' ? 'light' : 'dark';
        Object.entries(resolveChosenPalette(CHOSEN, mode, { sidebarTone: afterSecond.sidebarTone, topbarTone: afterSecond.topbarTone }))
            .forEach(([id, color]) => expect(afterSecond[id], `${second.id}.${id}`).toBe(color));
    });

    it('o que o tema declara e a paleta não calcula, e o resto do tema, fica como o tema declara', () => {
        const theme = withRoles[0];
        const mode = modeOf(theme);
        const theResolved = resolved(theme, mode);
        const design = composeThemeDesign(theResolved, { mode, keepPalette: true, colorPalette: CHOSEN }) as unknown as DesignRecord;
        const calculated = new Set([...ROLE_IDS, 'colorPalette', 'keepPalette']);
        Object.entries(theResolved).filter(([id]) => !calculated.has(id)).forEach(([id, value]) => expect(design[id], id).toEqual(value));
    });

    it('sem paleta válida escolhida, ligar o interruptor não muda o tema', () => {
        const theme = withRoles[0];
        const mode = modeOf(theme);
        const theResolved = resolved(theme, mode);
        const plain = composeThemeDesign(theResolved, { mode }) as unknown as DesignRecord;
        const kept = composeThemeDesign(theResolved, { mode, keepPalette: true }) as unknown as DesignRecord;
        expect({ ...kept, keepPalette: false }).toEqual(plain);
    });
});
