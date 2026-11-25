/**
 * O design gravado que o importador devolve como `config` do Provider (o caso do white label): com `persistence.configIsSavedDesign`,
 * as escolhas que vieram nele (paleta mantida, interruptor, paletas salvas) sobrevivem ao que a lib grava na troca de tema. Sem a
 * opção, o `config` segue sendo o valor do host e não é gravado como escolha.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { sarakLoadThemePreset } from '../../../Design/presets/themes/registry';
import { resolveThemeForMode, type ModeResolvableTheme } from '../../../Design/presets/themes/color-engine';
import { composeThemeDesign } from '../../../Design/presets/themes/compose';
import { encodeSavedPalettes } from '../../../Design/palette/savedPalettes';
import { validateDesign } from '../validation';
import { useDesignChoices, type SavedDesign } from '../../hooks/useDesignChoices';
import { SARAK_DESIGN_FORMAT_CHOICES } from '../designChoices';
import type { SarakDesignState, SarakThemeEntry, SarakThemePayload } from '../../types';

type DesignRecord = Record<string, unknown>;

let sovereign: ModeResolvableTheme;
let highContrast: ModeResolvableTheme;

const asTheme = (entry: SarakThemeEntry): ModeResolvableTheme => ({ design: entry.design as never, contraparte: entry.contraparte });
const SAVED = encodeSavedPalettes([{ id: 'sp-1', name: 'Marca', value: 'custom:triadic:#336699' }]);
const SAVED_DESIGN: DesignRecord = { colorPalette: 'emerald-royal', keepPalette: true, savedPalettes: SAVED };

beforeAll(async () => {
    sovereign = asTheme(await sarakLoadThemePreset('sarak-sovereign') as SarakThemeEntry);
    highContrast = asTheme(await sarakLoadThemePreset('high-contrast') as SarakThemeEntry);
});

/** O ciclo do Provider para um `config` e uma opção: hidratar o gravado, trocar o tema como o painel e gravar. */
const session = (config: DesignRecord, configIsSavedDesign: boolean, id = 'sarak-sovereign') => {
    const configRef = { current: config as SarakThemePayload };
    const { result } = renderHook(() => useDesignChoices(undefined, configRef, configIsSavedDesign));
    const load = (saved: DesignRecord, themeId: string): DesignRecord => result.current.restore(
        {} as SarakDesignState, { design: saved, format: SARAK_DESIGN_FORMAT_CHOICES, themeId } satisfies SavedDesign,
    ) as unknown as DesignRecord;
    const switchTo = (current: DesignRecord, theme: ModeResolvableTheme, themeId: string): DesignRecord => {
        const mode = current.mode === 'light' ? 'light' : 'dark';
        const draft = composeThemeDesign(resolveThemeForMode(theme, mode) as DesignRecord, current, configRef.current);
        return result.current.toPersisted(validateDesign(draft), themeId).design;
    };
    return { load, switchTo, id };
};

const CASES: Array<[string, DesignRecord, boolean]> = [
    ['design só por onLoad (controle)', {}, false],
    ['design como `config` + opção ligada', SAVED_DESIGN, true],
];

describe.each(CASES)('troca de tema com o %s', (_label, config, flag) => {
    const fromLoad = (saved: DesignRecord) => session(config, flag).load(saved, 'sarak-sovereign');

    it('"Manter minha paleta" + paleta: o gravado leva as duas chaves', () => {
        const { switchTo } = session(config, flag);
        expect(switchTo(fromLoad(SAVED_DESIGN), highContrast, 'high-contrast')).toMatchObject({ colorPalette: 'emerald-royal', keepPalette: true });
    });

    it('paletas salvas: o gravado leva a lista', () => {
        const { switchTo } = session(config, flag);
        expect(switchTo(fromLoad(SAVED_DESIGN), highContrast, 'high-contrast').savedPalettes).toBe(SAVED);
    });

    it('paleta + "Manter" + tema no mesmo rascunho, aplicado, recarregado e trocado de novo', () => {
        const { load, switchTo } = session(config, flag);
        const first = switchTo(fromLoad(SAVED_DESIGN), highContrast, 'high-contrast');
        const second = switchTo(load(first, 'high-contrast'), sovereign, 'sarak-sovereign');
        expect(second).toMatchObject({ colorPalette: 'emerald-royal', keepPalette: true, savedPalettes: SAVED });
    });
});

describe('troca de tema com o `config` e a opção ligada — o que não muda', () => {
    const NO_KEEP: DesignRecord = { colorPalette: 'emerald-royal', savedPalettes: SAVED };

    it('sem `keepPalette`, o tema novo traz a própria paleta e as paletas salvas ficam', () => {
        const { load, switchTo } = session(NO_KEEP, true);
        const saved = switchTo(load(NO_KEEP, 'sarak-sovereign'), highContrast, 'high-contrast');
        expect(saved.colorPalette).toBeUndefined();
        expect(saved.keepPalette).toBeUndefined();
        expect(saved.savedPalettes).toBe(SAVED);
    });

    it('o modo escolhido acumula sobre as escolhas do `config`', () => {
        const { load, switchTo } = session(SAVED_DESIGN, true);
        const light = { ...load(SAVED_DESIGN, 'sarak-sovereign'), mode: 'light' };
        expect(switchTo(light, highContrast, 'high-contrast')).toMatchObject({ mode: 'light', keepPalette: true, savedPalettes: SAVED });
    });

    it('o `onSave` segue esparso: nenhuma chave que ninguém escolheu', () => {
        const { load, switchTo } = session(SAVED_DESIGN, true);
        const keys = Object.keys(switchTo(load(SAVED_DESIGN, 'sarak-sovereign'), highContrast, 'high-contrast')).sort();
        expect(keys).toEqual(['colorPalette', 'keepPalette', 'savedPalettes']);
    });
});

describe('o `config` sem a opção segue como valor do host', () => {
    it('não é gravado como escolha, como antes', () => {
        const { load, switchTo } = session(SAVED_DESIGN, false);
        expect(switchTo(load(SAVED_DESIGN, 'sarak-sovereign'), highContrast, 'high-contrast')).toEqual({});
    });
});
