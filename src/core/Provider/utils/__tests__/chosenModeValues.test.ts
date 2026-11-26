import { beforeAll, describe, expect, it } from 'vitest';
import { sarakLoadThemePreset } from '../../../Design/presets/themes/registry';
import { chosenModeValueKeys } from '../chosenModeValues';
import { applyColorMode } from '../overlayPreferences';
import { findThemeEntry, recomposeDesignChoices } from '../designChoices';
import type { SarakThemeEntry } from '../../types';

const IDS = ['sarak-sovereign', 'neo-brutalism', 'industrial-terminal'] as const;
type Mode = 'light' | 'dark';
type Rec = Record<string, unknown>;

const entryOf = (id: string): SarakThemeEntry => {
    const theme = findThemeEntry(undefined, id)!;
    return { id, name: id, design: theme.design, contraparte: theme.contraparte } as unknown as SarakThemeEntry;
};

describe('o valor que o usuário escolheu vence o par de modo do tema', () => {
    beforeAll(async () => { await Promise.all(IDS.map((id) => sarakLoadThemePreset(id))); });

    it.each(IDS)('%s: `cardTextureOpacity` 0,5 vale nos dois modos', (id) => {
        const theme = findThemeEntry(undefined, id)!;
        const entry = entryOf(id);
        const base = recomposeDesignChoices({ cardTextureOpacity: 0.5 }, theme);
        (['light', 'dark'] as Mode[]).forEach((mode) => {
            expect((applyColorMode(base, mode, entry) as unknown as Rec).cardTextureOpacity).toBe(0.5);
        });
    });

    it.each(IDS)('%s: o que o usuário não escolheu continua trocando com o modo', (id) => {
        const theme = findThemeEntry(undefined, id)!;
        const entry = entryOf(id);
        const nativeMode: Mode = theme.design.mode === 'light' ? 'light' : 'dark';
        const opposite: Mode = nativeMode === 'light' ? 'dark' : 'light';
        const base = recomposeDesignChoices({ cardTextureOpacity: 0.5 }, theme);
        const flipped = applyColorMode(base, opposite, entry) as unknown as Rec;
        const counterpart = entry.contraparte as unknown as Rec;
        const untouched = Object.keys(counterpart).filter((key) => key !== 'mode' && key !== 'cardTextureOpacity' && typeof counterpart[key] === 'number');
        expect(untouched.length).toBeGreaterThan(0);
        untouched.forEach((key) => expect(flipped[key]).toBe(counterpart[key]));
    });

    it('sem escolha, o valor do par do tema entra no modo oposto', () => {
        const theme = findThemeEntry(undefined, 'sarak-sovereign')!;
        const base = recomposeDesignChoices({}, theme);
        const flipped = applyColorMode(base, 'light', entryOf('sarak-sovereign')) as unknown as Rec;
        expect(flipped.cardTextureOpacity).toBe((theme.contraparte as unknown as Rec).cardTextureOpacity);
    });

    it('cor nunca conta como escolha de modo: o aviso de customização de cor segue valendo', () => {
        const theme = findThemeEntry(undefined, 'sarak-sovereign')!;
        const base = { ...recomposeDesignChoices({}, theme), cardInnerGlowColor: '#123456' } as never;
        expect(chosenModeValueKeys(base, entryOf('sarak-sovereign')).has('cardInnerGlowColor')).toBe(false);
    });

    it('tema sem contraparte não tem escolha de modo', () => {
        expect(chosenModeValueKeys({ mode: 'dark', cardTextureOpacity: 0.5 } as never, { design: { mode: 'dark' } }).size).toBe(0);
    });
});
