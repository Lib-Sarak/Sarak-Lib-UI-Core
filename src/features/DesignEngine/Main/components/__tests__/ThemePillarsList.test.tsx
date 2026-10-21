import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemePillarsList } from '../ThemePillarsList';

describe('ThemePillarsList', () => {
    it('matches snapshot', () => {
        const props = {
            pillars: [{ id: 'colors', title: 'Cores', icon: () => <div/>, index: 1 }],
            activePillarId: 'colors',
            selectPillar: vi.fn(),
            activeSectionId: 'colors-geral',
            setActiveSectionId: vi.fn(),
            groupedStructure: { colors: { Geral: [{ id: 'test_token', label: 'Test' }] } },
            isTokenVisible: () => true,
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            catalogMap: new Map(),
            draft: { test_token: '#000' },
            updateDraft: vi.fn(),
            previewDevice: 'desktop',
        };

        const FinalProps = props as unknown as React.ComponentProps<typeof ThemePillarsList>;
        const { container } = render(<ThemePillarsList {...FinalProps} />);
        expect(container).toMatchSnapshot();
    });

    it('conta apenas os tokens visíveis e oculta pilares e seções vazios', () => {
        const visibleToken = { id: 'visibleToken', label: 'Visível' };
        const hiddenToken = { id: 'hiddenToken', label: 'Oculto' };
        const props = {
            pillars: [
                { id: 'colors', title: 'Cores', icon: () => <div />, index: 1 },
                { id: 'empty', title: 'Sem controles', icon: () => <div />, index: 2 }
            ],
            activePillarId: 'colors',
            selectPillar: vi.fn(),
            activeSectionId: 'colors-Geral',
            setActiveSectionId: vi.fn(),
            groupedStructure: {
                colors: { Geral: [visibleToken, hiddenToken], Vazio: [hiddenToken] },
                empty: { Geral: [hiddenToken] }
            },
            isTokenVisible: (tokenId: string) => tokenId === 'visibleToken',
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            catalogMap: new Map(),
            draft: {},
            updateDraft: vi.fn(),
            previewDevice: 'desktop',
        } as unknown as React.ComponentProps<typeof ThemePillarsList>;

        render(<ThemePillarsList {...props} />);

        expect(screen.getByText('Cores (1)')).toBeInTheDocument();
        expect(screen.getByText('Geral (1)')).toBeInTheDocument();
        expect(screen.queryByText('Vazio (0)')).toBeNull();
        expect(screen.queryByText('Sem controles (0)')).toBeNull();
    });

    it('encaminha a seleção do pilar para a ação que sincroniza o preview', () => {
        const selectPillar = vi.fn();
        const props = {
            pillars: [{ id: 'surfaces', title: 'Superfícies e cards', icon: () => <div />, index: 1 }],
            activePillarId: null,
            selectPillar,
            activeSectionId: null,
            setActiveSectionId: vi.fn(),
            groupedStructure: { surfaces: { Geral: [{ id: 'surfaceToken', label: 'Fundo' }] } },
            isTokenVisible: () => true,
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            catalogMap: new Map(),
            draft: {},
            updateDraft: vi.fn(),
            previewDevice: 'desktop',
        } as unknown as React.ComponentProps<typeof ThemePillarsList>;

        render(<ThemePillarsList {...props} />);
        fireEvent.click(screen.getByText('Superfícies e cards (1)'));

        expect(selectPillar).toHaveBeenCalledWith('surfaces');
    });
});
