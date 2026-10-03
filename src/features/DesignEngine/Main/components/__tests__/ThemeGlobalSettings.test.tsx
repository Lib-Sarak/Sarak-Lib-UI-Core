import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../ThemeGlobalSettings';
import { ThemeGlobalSettings } from '../ThemeGlobalSettings';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { PreferencesSchema, PREFERENCE_POSITION_TOKEN_IDS } from '../../../../../core/Design/schema/preferences';

// `SarakSelect` (o combobox de cada posição) lê `useSarakUI` mandatório.
const renderSettings = (props: Record<string, unknown>) =>
    render(<SarakUIProvider><ThemeGlobalSettings {...(props as unknown as React.ComponentProps<typeof ThemeGlobalSettings>)} /></SarakUIProvider>);

describe('ThemeGlobalSettings', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });
});

// Spec 05 §2.2.1 — o painel oferece a posição das 5 preferências.
describe('ThemeGlobalSettings — seção "Barra de Preferências do Usuário"', () => {
    const baseProps = () => ({
        activePillarId: 'global',
        setActivePillarId: vi.fn(),
        activeSectionId: 'global-preferences-bar',
        setActiveSectionId: vi.fn(),
        isDirty: false,
        onReset: vi.fn(),
        onApply: vi.fn(),
        globalComponent: { id: 'global', label: 'Global', tokens: [] },
        catalogMap: new Map(),
        draft: {},
        updateDraft: vi.fn(),
        previewDevice: 'desktop',
        sarak: { branding: {}, updateBranding: vi.fn() },
    });

    it('lista as 5 preferências, cada uma com as 3 posições oferecidas', () => {
        renderSettings(baseProps());
        expect(screen.getByText(`Barra de Preferências do Usuário (${PreferencesSchema.tokens.length})`)).toBeInTheDocument();
        PreferencesSchema.tokens.forEach((token) => {
            expect(screen.getByText(token.label)).toBeInTheDocument();
        });
        // As 3 posições aparecem como opção em cada select — pega o primeiro select.
        const selects = screen.getAllByRole('combobox');
        expect(selects).toHaveLength(PreferencesSchema.tokens.length);
        expect(screen.getAllByText('Não oferecida').length).toBeGreaterThan(0);
        expect(screen.getAllByText('No menu').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Fixa na barra').length).toBeGreaterThan(0);
    });

    it('trocar a posição de uma preferência chama updateDraft com o token certo', () => {
        const props = baseProps();
        renderSettings(props);
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'menu' } });
        expect(props.updateDraft).toHaveBeenCalledWith(PREFERENCE_POSITION_TOKEN_IDS.colorMode, 'menu');
    });
});
