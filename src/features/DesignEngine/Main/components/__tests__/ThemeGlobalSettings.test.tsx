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
        globalComponent: { id: 'global', label: 'Global', tokens: [] },
        catalogMap: new Map(),
        draft: {},
        updateDraft: vi.fn(),
        previewDevice: 'desktop',
        sarak: { branding: {}, updateBranding: vi.fn() },
    });

    it('lista as 5 preferências, cada uma com as 3 posições oferecidas', () => {
        renderSettings(baseProps());
        expect(screen.getByRole('heading', { name: 'Barra de Preferências do Usuário' })).toBeInTheDocument();
        PreferencesSchema.tokens.forEach((token) => {
            expect(screen.getByRole('combobox', { name: token.label })).toBeInTheDocument();
        });
        // As 3 posições aparecem como opção em cada select — pega o primeiro select.
        const selects = screen.getAllByRole('combobox');
        expect(selects).toHaveLength(PreferencesSchema.tokens.length);
        expect(screen.getAllByText('Esconder').length).toBeGreaterThan(0);
        expect(screen.getAllByText('No menu').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Mostrar').length).toBeGreaterThan(0);
    });

    it('traz as três seções do bloco global abertas, sem acordeão, e a identidade só com a porta de marca', () => {
        renderSettings({ ...baseProps(), globalComponent: { id: 'global', label: 'Global', tokens: [] } });
        ['Preferências Globais', 'Barra de Preferências do Usuário', 'Identidade da Empresa'].forEach((name) => {
            expect(screen.getByRole('region', { name })).toBeInTheDocument();
        });
        expect(screen.queryByRole('button', { name: /Configurações globais/ })).toBeNull();
    });

    it('trocar a posição de uma preferência chama updateDraft com o token certo', () => {
        const props = baseProps();
        renderSettings(props);
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'menu' } });
        expect(props.updateDraft).toHaveBeenCalledWith(PREFERENCE_POSITION_TOKEN_IDS.colorMode, 'menu');
    });
});

describe('ThemeGlobalSettings — tokens que a decisão já mostra por pergunta', () => {
    const base = () => ({
        globalComponent: { id: 'global', label: 'Global', tokens: [] },
        catalogMap: new Map(),
        draft: {},
        updateDraft: vi.fn(),
        previewDevice: 'desktop',
        sarak: { branding: {}, updateBranding: vi.fn() },
    });

    it('um token citado em omitTokenIds sai da barra de preferências, e os outros ficam', () => {
        const omitted = PREFERENCE_POSITION_TOKEN_IDS.colorMode;
        renderSettings({ ...base(), omitTokenIds: new Set([omitted]) });
        const omittedLabel = PreferencesSchema.tokens.find((token) => token.id === omitted)!.label;
        expect(screen.queryByRole('combobox', { name: omittedLabel })).toBeNull();
        expect(screen.getAllByRole('combobox')).toHaveLength(PreferencesSchema.tokens.length - 1);
    });

    it('com todas as preferências omitidas a seção some inteira, sem título solto', () => {
        renderSettings({ ...base(), omitTokenIds: new Set(PreferencesSchema.tokens.map((token) => token.id)) });
        expect(screen.queryByRole('heading', { name: 'Barra de Preferências do Usuário' })).toBeNull();
    });
});
