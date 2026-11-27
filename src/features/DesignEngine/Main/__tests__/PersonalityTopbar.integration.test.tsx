/**
 * As Personalidades aplicam pelo painel completo, uma depois da outra: o clique numa opção não tira o usuário da decisão aberta e o
 * "Aplicar" habilita. Cobre as dez, as de navegação no topo e as de lateral, pelo caminho do usuário (Provider + coluna + rascunho).
 */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { PERSONALITIES } from '../../../../core/Design/presets/components/personalities';
import { ThemeCustomizationTab } from '../ThemeCustomizationTab';

import { prazoDeTeste } from '../../../../shared/testing/prazoDeTeste';
vi.mock('../../Canvas/PreviewCanvas', () => ({
    PreviewCanvas: () => <div data-testid="preview-canvas" />,
}));

vi.setConfig({ testTimeout: prazoDeTeste(120000) });

describe('Personalidades pelo painel', () => {
    it('as dez aplicam, uma depois da outra, sem sair da decisão e com o Aplicar habilitado', async () => {
        const user = userEvent.setup();
        render(
            <SarakUIProvider initialTheme="sarak-sovereign" options={{ fonts: 'none' }}>
                <div style={{ width: 1200, height: 800 }}><ThemeCustomizationTab /></div>
            </SarakUIProvider>,
        );
        await user.click((await screen.findAllByRole('button', { name: /^Tema/ }))[0]);
        await user.click(await screen.findByRole('button', { name: 'Personalidades' }));
        const group = await waitFor(() => {
            const node = document.querySelector<HTMLElement>('[data-preset-group="personalities"]');
            expect(node).not.toBeNull();
            return node!;
        });
        expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled();
        const failures: string[] = [];
        for (const personality of PERSONALITIES) {
            await user.click(within(group).getByRole('button', { name: new RegExp(personality.name) }));
            const stayed = screen.queryByRole('button', { name: 'Voltar para a lista de decisões' }) !== null && document.querySelector('[data-preset-group="personalities"]') !== null;
            const applyEnabled = (screen.getByRole('button', { name: 'Aplicar' }) as HTMLButtonElement).disabled === false;
            if (!stayed || !applyEnabled) failures.push(`${personality.id}: ficou na decisão=${stayed}, Aplicar habilitado=${applyEnabled}`);
        }
        expect(failures).toEqual([]);
    });
});
