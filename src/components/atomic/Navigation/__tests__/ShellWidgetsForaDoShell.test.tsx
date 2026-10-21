import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakAppChrome } from '../../../Layout/SarakAppChrome';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakDeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { SarakShellSearchWidget } from '../SarakShellSearchWidget';
import { SarakShellThemeToggle } from '../SarakShellThemeToggle';
import { SarakShellUserWidget } from '../SarakShellUserWidget';
import { SarakShellLanguageSelector } from '../SarakShellLanguageSelector';
import { PREFERENCE_POSITION_TOKEN_IDS } from '../../../../core/Provider/preferencesTypes';

/**
 * Os quatro widgets compõem slots independentes — este
 * arquivo prova que cada um monta e funciona dentro de um SLOT do
 * `SarakAppChrome`, sob o `SarakUIProvider`, sem registro global de módulos.
 * Falha se algum dos quatro voltar a depender do registro.
 */
// O cromo fica desligado para isolar os widgets que o consumidor monta nos slots.
const NO_DEFAULTS = { search: false, themeToggle: false, user: false, notifications: false, collapse: false } as const;
const NO_PREFERENCE_DEFAULTS = Object.fromEntries(
    Object.values(PREFERENCE_POSITION_TOKEN_IDS).map((tokenId) => [tokenId, 'off']),
);

const renderNoSlot = (
    slot: React.ReactNode,
    slotName: 'topbarStart' | 'topbarEnd' | 'sidebarFooter',
    navigationStyle: 'topbar' | 'sidebar' = 'topbar',
    config: Record<string, unknown> = {},
) =>
    render(
        <SarakUIProvider config={{ ...NO_PREFERENCE_DEFAULTS, ...config }}>
            <SarakDeviceProvider overrideDevice="desktop">
                <SarakAppChrome navigationStyle={navigationStyle} widgets={NO_DEFAULTS} {...{ [slotName]: slot }}>
                    <div>conteúdo do app</div>
                </SarakAppChrome>
            </SarakDeviceProvider>
        </SarakUIProvider>,
    );

describe('Widgets do cromo montados em slots do SarakAppChrome', () => {
    it('ShellSearchWidget: funciona com lista de navegação vazia', () => {
        const { container } = renderNoSlot(
            <SarakShellSearchWidget variant="bar" onClick={vi.fn()} />,
            'topbarStart',
        );
        const input = screen.getByPlaceholderText('Busca inteligente…');
        expect(container.querySelector('[data-sarak-slot="topbarStart"]')).toContainElement(input);

        fireEvent.change(input, { target: { value: 'qualquer coisa' } });
        // Sem itens de navegação, a busca funciona e devolve vazio.
        expect(screen.getByText(/Nenhum resultado para/i)).toBeInTheDocument();
    });

    it('ShellThemeToggle: alterna o tema', () => {
        const { container } = renderNoSlot(
            <SarakShellThemeToggle variant="horizontal" />,
            'topbarEnd',
            'topbar',
            { [PREFERENCE_POSITION_TOKEN_IDS.colorMode]: 'pinned' },
        );
        const btn = screen.getByRole('button');
        expect(container.querySelector('[data-sarak-slot="topbarEnd"]')).toContainElement(btn);

        const titleBefore = btn.getAttribute('title');
        fireEvent.click(btn);
        expect(btn.getAttribute('title')).not.toBe(titleBefore);
    });

    it('ShellLanguageSelector: abre o dropdown', () => {
        renderNoSlot(<SarakShellLanguageSelector variant="horizontal" />, 'topbarEnd', 'topbar', { enabledLanguages: ['pt', 'en'] });
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('ShellUserWidget: exibe o usuário e aciona logout', () => {
        const logout = vi.fn();
        renderNoSlot(
            <SarakShellUserWidget user={{ name: 'Visitante' }} logout={logout} variant="vertical" />,
            'sidebarFooter',
            'sidebar',
        );
        expect(screen.getByText('Visitante')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button'));
        expect(logout).toHaveBeenCalled();
    });
});
