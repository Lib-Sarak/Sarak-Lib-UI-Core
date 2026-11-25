/**
 * O design gravado que o importador devolve como `config` do `SarakUIProvider` (o white label), com `persistence.configIsSavedDesign`,
 * pelo caminho real: o Provider montado como o hub (`config` + `initialTheme` + opção) e a troca de tema feita pelo rascunho do painel
 * (`useDesignDraft`), comparada com o controle em que o mesmo design chega só por `onLoad`. Mora em `features/` porque integra o
 * Provider (`core/`) com o painel, o que `core/` não pode importar.
 */
import React from 'react';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { sarakLoadThemePreset } from '../../../../core/Design/presets/themes/registry';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import { encodeSavedPalettes } from '../../../../core/Design/palette/savedPalettes';
import { useDesignDraft } from '../useDesignDraft';
import type { SarakThemePayload, SarakUIOptions } from '../../../../core/Provider/types';

type DesignRecord = Record<string, unknown>;
type OnSave = NonNullable<NonNullable<SarakUIOptions['persistence']>['onSave']>;

const SAVED = encodeSavedPalettes([{ id: 'sp-1', name: 'Marca', value: 'custom:triadic:#336699' }]);
/** O que o usuário gravou: paleta mantida, paletas salvas e uma cor de fundo ajustada à mão, no tema de origem. */
const SAVED_DESIGN: DesignRecord = { colorPalette: 'emerald-royal', keepPalette: true, savedPalettes: SAVED };
/** O gravado do veredito: paleta e uma cor de fundo ajustada à mão, no tema de origem, sem "Manter". */
const HAND_DESIGN: DesignRecord = { colorPalette: 'emerald-royal', bgBaseColor: '#102030' };
const FROM_THEME = 'sarak-sovereign';
const TO_THEME = 'industrial-terminal';

let targetPayload: DesignRecord;

beforeAll(async () => {
    await sarakLoadThemePreset(FROM_THEME);
    const target = await sarakLoadThemePreset(TO_THEME) as { design: DesignRecord; contraparte?: DesignRecord };
    targetPayload = resolveThemeForMode({ design: target.design as never, contraparte: target.contraparte as never }, 'dark') as unknown as DesignRecord;
});

const Harness = (): React.ReactElement => {
    const sarak = useSarakUI();
    const { handleThemePreview, handleApplyToSystem } = useDesignDraft(sarak);
    return (
        <div>
            <button data-testid="switch" onClick={() => handleThemePreview(targetPayload as never, undefined, TO_THEME)}>Trocar tema</button>
            <button data-testid="apply" onClick={() => handleApplyToSystem()}>Aplicar</button>
        </div>
    );
};

/** Monta o Provider, troca o tema pelo painel, aplica, e devolve o que `onSave` recebeu na última gravação. */
const savedAfterThemeSwitch = async (props: { config?: SarakThemePayload; initialTheme?: string; persistence: NonNullable<SarakUIOptions['persistence']> }): Promise<DesignRecord> => {
    const onSave = vi.fn<OnSave>().mockResolvedValue(undefined);
    render(
        <SarakUIProvider config={props.config} initialTheme={props.initialTheme} options={{ persistence: { ...props.persistence, onSave } }}>
            <Harness />
        </SarakUIProvider>,
    );
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByTestId('switch'));
    await act(async () => { fireEvent.click(screen.getByTestId('apply')); });
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const saved = onSave.mock.calls.at(-1)?.[0] as unknown as DesignRecord;
    cleanup();
    localStorage.clear();
    return saved;
};

describe('troca de tema pelo painel — o `config` como design gravado', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { cleanup(); vi.restoreAllMocks(); });

    const control = (design: DesignRecord = SAVED_DESIGN) => savedAfterThemeSwitch({
        persistence: { onLoad: () => ({ design: design as SarakThemePayload, activeThemeId: FROM_THEME, format: 2 }) },
    });
    const hub = (configIsSavedDesign: boolean, design: DesignRecord = SAVED_DESIGN) => savedAfterThemeSwitch({
        config: design as SarakThemePayload,
        initialTheme: FROM_THEME,
        persistence: { configIsSavedDesign },
    });

    it('com a opção, o gravado é o do controle `onLoad`: leva paleta, "Manter" e paletas salvas', async () => {
        const saved = await hub(true);
        expect(saved).toMatchObject({ colorPalette: 'emerald-royal', keepPalette: true, savedPalettes: SAVED });
        expect(saved).toEqual(await control());
    });

    it('com a opção, a cor à mão do tema anterior não fica no rascunho do tema novo nem vai para o gravado, como no controle', async () => {
        const saved = await hub(true, HAND_DESIGN);
        expect(saved.bgBaseColor).toBeUndefined();
        expect(saved).toEqual(await control(HAND_DESIGN));
    });

    it('sem a opção, o `config` segue como valor do host (a cor à mão dele continua valendo e fora do gravado)', async () => {
        const saved = await hub(false);
        expect(saved.keepPalette).toBeUndefined();
        expect(saved.savedPalettes).toBeUndefined();
    });
});
