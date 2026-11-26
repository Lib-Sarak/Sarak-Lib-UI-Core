/**
 * O que `onSave` recebe pelo caminho real (Provider + rascunho do painel): só as chaves que o usuário escolheu, venha o tema por
 * `onLoad`, `initialTheme` ou `config`. Mora em `features/` porque integra o Provider (`core/`) com o painel.
 */
import React from 'react';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { getLoadedThemePreset } from '../../../../core/Design/presets/themes/registry';
import { useDesignDraft } from '../useDesignDraft';
import type { SarakUIOptions } from '../../../../core/Provider/types';

type DesignRecord = Record<string, unknown>;
type OnSave = NonNullable<NonNullable<SarakUIOptions['persistence']>['onSave']>;

const Harness = ({ change }: { change: [string, string] }): React.ReactElement => {
    const sarak = useSarakUI();
    const { updateDraft, handleApplyToSystem } = useDesignDraft(sarak);
    return (
        <div>
            <button data-testid="change" onClick={() => updateDraft(change[0], change[1])}>Escolher</button>
            <button data-testid="apply" onClick={() => handleApplyToSystem()}>Aplicar</button>
        </div>
    );
};

interface Load { themeId: string; via: 'onLoad' | 'initialTheme'; saved?: DesignRecord }

/** Monta o Provider com o tema vindo por `via`, faz a escolha pelo rascunho, aplica e devolve o que `onSave` recebeu. */
const savedAfterChoice = async (load: Load, change: [string, string]): Promise<DesignRecord> => {
    const onSave = vi.fn<OnSave>().mockResolvedValue(undefined);
    const persistence: NonNullable<SarakUIOptions['persistence']> = { onSave };
    if (load.via === 'onLoad') persistence.onLoad = () => ({ design: (load.saved ?? {}) as never, activeThemeId: load.themeId, format: 2 });
    render(
        <SarakUIProvider initialTheme={load.via === 'initialTheme' ? load.themeId : undefined} options={{ persistence }}>
            <Harness change={change} />
        </SarakUIProvider>,
    );
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
    // O tema do id gravado entra em memória sozinho; sem ele a lib não tem contra o que extrair as escolhas.
    await waitFor(() => expect(getLoadedThemePreset(load.themeId)).toBeDefined(), { timeout: 10_000 });
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 300)); });
    fireEvent.click(screen.getByTestId('change'));
    await act(async () => { fireEvent.click(screen.getByTestId('apply')); });
    await waitFor(() => expect(onSave).toHaveBeenCalled(), { timeout: 5000 });
    return onSave.mock.calls.at(-1)?.[0] as unknown as DesignRecord;
};

describe('o design gravado guarda só as escolhas', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

    // O tom escolhido é sempre diferente do que o tema declara para a lateral.
    it.each([['neo-brutalism', 'inverse'], ['cyberpunk-neon', 'primary'], ['industrial-terminal', 'inverse']])(
        '%s por `onLoad`: o tom "%s" grava só `sidebarTone`',
        async (themeId, tone) => {
            const saved = await savedAfterChoice({ themeId, via: 'onLoad' }, ['sidebarTone', tone]);
            expect(saved).toEqual({ sidebarTone: tone });
        },
    );

    it('sarak-sovereign: aplicar uma escolha qualquer não acrescenta `layout`', async () => {
        const saved = await savedAfterChoice({ themeId: 'sarak-sovereign', via: 'initialTheme' }, ['sidebarTone', 'inverse']);
        expect(saved).toEqual({ sidebarTone: 'inverse' });
    });

    it('sarak-sovereign: aplicar o modo oposto ao nativo grava `mode` e nenhuma cor calculada', async () => {
        const saved = await savedAfterChoice({ themeId: 'sarak-sovereign', via: 'initialTheme' }, ['mode', 'light']);
        expect(saved).toEqual({ mode: 'light' });
    });

    it('sarak-sovereign gravado no modo claro: voltar ao escuro (o nativo) não grava cor calculada, e o gravado fica vazio', async () => {
        const saved = await savedAfterChoice({ themeId: 'sarak-sovereign', via: 'onLoad', saved: { mode: 'light' } }, ['mode', 'dark']);
        expect(saved).toEqual({});
    });
});
