import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakAppChrome } from '../../../Layout/SarakAppChrome';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { DeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { ShellSearchWidget } from '../ShellSearchWidget';
import { ShellThemeToggle } from '../ShellThemeToggle';
import { ShellUserWidget } from '../ShellUserWidget';
import { ShellLanguageSelector } from '../ShellLanguageSelector';

/**
 * Os quatro widgets deixaram de ser internos ao `SarakShell` — este
 * arquivo prova que cada um monta e funciona dentro de um SLOT do
 * `SarakAppChrome`, sob o `SarakUIProvider`, SEM `SarakShell` e SEM nenhum
 * módulo registrado no Discovery. Falha se algum dos quatro voltar a
 * pressupor o Shell.
 */
const renderNoSlot = (
    slot: React.ReactNode,
    slotName: 'topbarStart' | 'topbarEnd' | 'sidebarFooter',
    navigationStyle: 'topbar' | 'sidebar' = 'topbar',
) =>
    render(
        <SarakUIProvider>
            <DeviceProvider overrideDevice="desktop">
                <SarakAppChrome navigationStyle={navigationStyle} {...{ [slotName]: slot }}>
                    <div>conteúdo do app</div>
                </SarakAppChrome>
            </DeviceProvider>
        </SarakUIProvider>,
    );

describe('Widgets do cromo montados fora do SarakShell, num slot do SarakAppChrome', () => {
    it('ShellSearchWidget: funciona sem nenhum módulo registrado no Discovery', () => {
        const { container } = renderNoSlot(
            <ShellSearchWidget variant="bar" onClick={vi.fn()} />,
            'topbarStart',
        );
        const input = screen.getByPlaceholderText('Smart Search...');
        expect(container.querySelector('[data-sarak-slot="topbarStart"]')).toContainElement(input);

        fireEvent.change(input, { target: { value: 'qualquer coisa' } });
        // Sem SarakShell/registro, nenhum módulo existe — a busca funciona e devolve vazio.
        expect(screen.getByText(/No results for/i)).toBeInTheDocument();
    });

    it('ShellThemeToggle: alterna o tema sem SarakShell', () => {
        const { container } = renderNoSlot(<ShellThemeToggle variant="horizontal" />, 'topbarEnd');
        const btn = screen.getByRole('button');
        expect(container.querySelector('[data-sarak-slot="topbarEnd"]')).toContainElement(btn);

        const titleBefore = btn.getAttribute('title');
        fireEvent.click(btn);
        expect(btn.getAttribute('title')).not.toBe(titleBefore);
    });

    it('ShellLanguageSelector: abre o dropdown sem SarakShell', () => {
        renderNoSlot(<ShellLanguageSelector variant="horizontal" />, 'topbarEnd');
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('ShellUserWidget: exibe o usuário e aciona logout sem SarakShell', () => {
        const logout = vi.fn();
        renderNoSlot(
            <ShellUserWidget user={{ username: 'visitante' }} logout={logout} variant="vertical" />,
            'sidebarFooter',
            'sidebar',
        );
        expect(screen.getByText('visitante')).toBeInTheDocument();
        fireEvent.click(screen.getByTitle('Logout'));
        expect(logout).toHaveBeenCalled();
    });
});
