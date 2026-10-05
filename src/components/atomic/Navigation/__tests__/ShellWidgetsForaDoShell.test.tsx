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

/**
 * Os quatro widgets compõem slots independentes — este
 * arquivo prova que cada um monta e funciona dentro de um SLOT do
 * `SarakAppChrome`, sob o `SarakUIProvider`, sem registro global de módulos.
 * Falha se algum dos quatro voltar a depender do registro.
 */
// Os defaults do cromo (busca/tema/usuário/colapso) desligam por inteiro aqui: o
// objetivo deste arquivo é provar cada widget MONTADO À MÃO pelo consumidor num slot —
// os defaults montariam um segundo exemplar do mesmo widget e ambiguariam as buscas
// por texto/role/placeholder abaixo.
const NO_DEFAULTS = { search: false, themeToggle: false, user: false, collapse: false } as const;

const renderNoSlot = (
    slot: React.ReactNode,
    slotName: 'topbarStart' | 'topbarEnd' | 'sidebarFooter',
    navigationStyle: 'topbar' | 'sidebar' = 'topbar',
    config: Record<string, unknown> = {},
) =>
    render(
        <SarakUIProvider config={config}>
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
        const { container } = renderNoSlot(<SarakShellThemeToggle variant="horizontal" />, 'topbarEnd');
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
            <SarakShellUserWidget user={{ username: 'visitante' }} logout={logout} variant="vertical" />,
            'sidebarFooter',
            'sidebar',
        );
        expect(screen.getByText('visitante')).toBeInTheDocument();
        fireEvent.click(screen.getByTitle('Sair'));
        expect(logout).toHaveBeenCalled();
    });
});
