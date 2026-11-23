import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { useSarakUI } from '../../../../../core/Provider/hooks/useSarakUI';
import { UIContext } from '../../../../../core/Provider/context';
import { DecisionTokenRow } from '../DecisionTokenRow';
import type { SarakDesignToken, SarakTokenValue } from '../../../../../core/Design/types';
import type { SarakUserPreferences } from '../../../../../core/Provider/preferencesTypes';
import type { SarakUIContextType } from '../../../../../core/Provider/types';

const navigationStyle = { id: 'navigationStyle', label: 'Navegação', type: 'select', defaultValue: 'sidebar', constraints: { options: [{ id: 'sidebar', value: 'sidebar', label: 'Lateral' }, { id: 'topbar', value: 'topbar', label: 'Topo' }] } } as unknown as SarakDesignToken;
const navbarLayout = { id: 'navbarLayout', label: 'Comportamento da Topbar', type: 'select', defaultValue: 'sticky', interactsWith: ['navigationStyle'], constraints: { options: [{ id: 'sticky', value: 'sticky', label: 'Fixo' }] } } as unknown as SarakDesignToken;
const sidebarWidth = { id: 'sidebarWidth', label: 'Largura', type: 'slider', defaultValue: 240, isResponsive: true, constraints: { min: 200, max: 400 } } as unknown as SarakDesignToken;

const renderRow = (token: SarakDesignToken, draft: Record<string, SarakTokenValue>, preferences: SarakUserPreferences = {}, updatePreferences = vi.fn()) => {
    render(
        <SarakUIProvider>
            <UIContext.Provider value={{ preferences, updatePreferences } as unknown as SarakUIContextType}>
                <DecisionTokenRow token={token} draft={draft} updateDraft={vi.fn()} previewDevice="desktop" />
            </UIContext.Provider>
        </SarakUIProvider>,
    );
    return updatePreferences;
};

describe('DecisionTokenRow — preferência pessoal por cima do tema', () => {
    it('com a preferência gravada, avisa o valor e a ação apaga só aquela preferência', () => {
        const updatePreferences = renderRow(navigationStyle, { navigationStyle: 'topbar' }, { navigationStyle: 'sidebar', fontSize: 'lg' });
        expect(screen.getByTestId('token-personal-note')).toHaveTextContent('Sua preferência pessoal (Lateral) está por cima do tema');
        fireEvent.click(screen.getByRole('button', { name: 'Apagar minha preferência' }));
        expect(updatePreferences).toHaveBeenCalledTimes(1);
        expect(updatePreferences).toHaveBeenCalledWith({ navigationStyle: undefined });
    });

    it('sem preferência gravada, não há aviso nem ação', () => {
        renderRow(navigationStyle, { navigationStyle: 'topbar' }, {});
        expect(screen.queryByTestId('token-personal-note')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Apagar minha preferência' })).toBeNull();
    });

    it('preferência que o tema não oferece não é avisada', () => {
        renderRow(navigationStyle, { navigationStyle: 'topbar', preferenceNavigationStylePosition: 'off' }, { navigationStyle: 'sidebar' });
        expect(screen.queryByTestId('token-personal-note')).toBeNull();
    });
});

describe('DecisionTokenRow — controle que não vale com a navegação de hoje', () => {
    it('navbarLayout com navegação lateral fica desabilitado e diz o motivo', () => {
        renderRow(navbarLayout, { navigationStyle: 'sidebar', navbarLayout: 'sticky' });
        expect(document.querySelector('[data-token-row="navbarLayout"] fieldset')).toBeDisabled();
        expect(screen.getByTestId('token-inactive-note')).toHaveTextContent('Só vale com navegação no topo');
    });

    it('com navegação no topo o mesmo controle fica habilitado, sem nota', () => {
        renderRow(navbarLayout, { navigationStyle: 'topbar', navbarLayout: 'sticky' });
        expect(document.querySelector('[data-token-row="navbarLayout"] fieldset')).not.toBeDisabled();
        expect(screen.queryByTestId('token-inactive-note')).toBeNull();
    });
});

describe('DecisionTokenRow — largura da lateral', () => {
    it('mostra e respeita o piso do design: o slider nasce em 300, não em 200', () => {
        renderRow(sidebarWidth, { sidebarWidth: { mob: 200, tab: 220, desk: 320 }, sidebarMinWidth: { mob: 150, tab: 180, desk: 300 }, sidebarMaxWidth: { mob: 300, tab: 400, desk: 600 } });
        expect(screen.getByTestId('token-range-note')).toHaveTextContent('Entre 300 e 400 px');
        const slider = screen.getByRole('slider');
        expect(slider).toHaveAttribute('min', '300');
        expect(slider).toHaveAttribute('max', '400');
    });
});

const PREFERENCES_KEY = 'sarak-ui-preferences-v1';
const modeToken = { id: 'mode', label: 'Modo', type: 'select', defaultValue: 'dark', constraints: { options: [{ id: 'dark', value: 'dark', label: 'Escuro' }, { id: 'light', value: 'light', label: 'Claro' }] } } as unknown as SarakDesignToken;

/** Mostra o design EFETIVO (tema + preferência) ao lado da linha, para o teste medir o que o usuário vê e não só o que foi gravado. */
const EffectiveProbe: React.FC = () => {
    const { design } = useSarakUI();
    return <output data-testid="effective">{String(design.navigationStyle)}/{String(design.mode)}</output>;
};

const renderWithRealProvider = (token: SarakDesignToken, draft: Record<string, SarakTokenValue>, props: Partial<React.ComponentProps<typeof SarakUIProvider>>) =>
    render(
        <SarakUIProvider {...props}>
            <EffectiveProbe />
            <DecisionTokenRow token={token} draft={draft} updateDraft={vi.fn()} previewDevice="desktop" />
        </SarakUIProvider>,
    );

describe('DecisionTokenRow — modo padrão do host × escolha gravada (Provider real)', () => {
    beforeEach(() => localStorage.removeItem(PREFERENCES_KEY));

    it('com defaultColorMode do host e nada gravado, a linha do modo NÃO mostra aviso (não há o que apagar)', async () => {
        renderWithRealProvider(modeToken, {}, { options: { preferences: { defaultColorMode: 'light' } } });
        await screen.findByTestId('effective');
        expect(screen.queryByTestId('token-personal-note')).toBeNull();
    });

    it('com escolha gravada, mostra o aviso, e apagar o tira', async () => {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ colorMode: 'dark' }));
        renderWithRealProvider(modeToken, {}, { options: { preferences: { defaultColorMode: 'light' } } });
        expect(await screen.findByTestId('token-personal-note')).toHaveTextContent('Sua preferência pessoal');
        fireEvent.click(screen.getByRole('button', { name: 'Apagar minha preferência' }));
        await waitFor(() => expect(screen.queryByTestId('token-personal-note')).toBeNull());
        expect(localStorage.getItem(PREFERENCES_KEY) ?? '').not.toContain('colorMode');
    });
});

describe('DecisionTokenRow — apagar volta o design EFETIVO ao valor do tema (Provider real)', () => {
    beforeEach(() => localStorage.removeItem(PREFERENCES_KEY));

    it('navigationStyle gravado como lateral por cima de um tema no topo: apagar devolve o topo ao design efetivo', async () => {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ navigationStyle: 'sidebar' }));
        renderWithRealProvider(navigationStyle, { navigationStyle: 'topbar' }, { config: { navigationStyle: 'topbar' } });
        await waitFor(() => expect(screen.getByTestId('effective').textContent).toMatch(/^sidebar\//));
        fireEvent.click(screen.getByRole('button', { name: 'Apagar minha preferência' }));
        await waitFor(() => expect(screen.getByTestId('effective').textContent).toMatch(/^topbar\//));
        expect(screen.queryByTestId('token-personal-note')).toBeNull();
    });
});
