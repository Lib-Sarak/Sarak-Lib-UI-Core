/**
 * Com `persistence.configIsSavedDesign` e o tema CONTROLADO pela prop `activeThemeId`, a troca de tema não compõe o `config` (o design
 * gravado do tema anterior) como host: o token que o tema novo não declara volta ao padrão, e não ao valor do tema de origem.
 * Mora em `features/` pelo mesmo motivo do teste de integração vizinho: monta o Provider inteiro com temas embarcados.
 */
import React from 'react';
import { render, screen, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeAll, beforeEach, afterEach, describe, expect, it } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { sarakLoadThemePreset } from '../../../../core/Design/presets/themes/registry';
import { sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import type { SarakThemePayload } from '../../../../core/Provider/types';

const FROM_THEME = 'sarak-sovereign';
const TO_THEME = 'industrial-terminal';
/** Candidatos a "token que o tema de destino não declara": o primeiro que ele de fato não traz serve de sonda. */
const PROBE_CANDIDATES = ['inputPadding', 'tooltipRadius', 'badgeRadius', 'statusGlowBlur', 'tableBorderRadius'];
const HAND_VALUE = 23;

let probeKey: string;

beforeAll(async () => {
    await sarakLoadThemePreset(FROM_THEME);
    const target = await sarakLoadThemePreset(TO_THEME) as { design: Record<string, unknown>; contraparte?: Record<string, unknown> };
    const declared = new Set([...Object.keys(target.design), ...Object.keys(target.contraparte ?? {})]);
    const found = PROBE_CANDIDATES.find((key) => !declared.has(key) && typeof (sarakGetDefaultDesignState() as Record<string, unknown>)[key] === 'number');
    if (!found) throw new Error('nenhum token-sonda: todos os candidatos são declarados pelo tema de destino');
    probeKey = found;
});

const Probe = (): React.ReactElement => {
    const sarak = useSarakUI() as unknown as Record<string, unknown>;
    return <output data-testid="probe">{String(sarak[probeKey])}</output>;
};

/** O que o painel lê do token-sonda depois de o tema controlado ir de FROM para TO, com o `config` carregando o ajuste feito à mão. */
const probeAfterSwitchByProp = async (configIsSavedDesign: boolean): Promise<string> => {
    const config = { [probeKey]: HAND_VALUE } as unknown as SarakThemePayload;
    const tree = (activeThemeId: string) => (
        <SarakUIProvider config={config} activeThemeId={activeThemeId} options={{ persistence: { configIsSavedDesign } }}>
            <Probe />
        </SarakUIProvider>
    );
    const { rerender } = render(tree(FROM_THEME));
    await act(async () => { await Promise.resolve(); });
    await waitFor(() => expect(screen.getByTestId('probe')).toBeInTheDocument());
    await act(async () => { rerender(tree(TO_THEME)); });
    await act(async () => { await Promise.resolve(); });
    return screen.getByTestId('probe').textContent ?? '';
};

describe('troca de tema pela prop `activeThemeId` — o `config` como design gravado', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { cleanup(); localStorage.clear(); });

    it('com a opção, o ajuste que veio no `config` não é imposto ao tema novo: o token volta ao padrão', async () => {
        const padrao = String((sarakGetDefaultDesignState() as Record<string, unknown>)[probeKey]);
        expect(await probeAfterSwitchByProp(true)).toBe(padrao);
    });

    it('contraprova: sem a opção, o `config` é o host e o token que o tema não declara vale o dele', async () => {
        expect(await probeAfterSwitchByProp(false)).toBe(String(HAND_VALUE));
    });
});
