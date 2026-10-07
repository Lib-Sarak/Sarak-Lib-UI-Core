import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeImpactList } from '../ThemeImpactList';

vi.mock('../TokenControl', () => ({
    TokenControl: ({ token }: { token: { id: string } }) => (
        <div data-testid="token-control">{token.id}</div>
    )
}));

type ThemeImpactListProps = React.ComponentProps<typeof ThemeImpactList>;

const createImpactToken = (
    id: string,
    group: ThemeImpactListProps['tokens'][number]['group']
): ThemeImpactListProps['tokens'][number] => ({
    token: { id, label: id, type: 'text', defaultValue: '' },
    group
});

const createProps = (tokens: ThemeImpactListProps['tokens']): ThemeImpactListProps => ({
    tokens,
    catalogMap: new Map(),
    draft: {} as ThemeImpactListProps['draft'],
    updateDraft: vi.fn(),
    previewDevice: 'desktop'
});

describe('ThemeImpactList', () => {
    it('renderiza os cinco grupos abertos com títulos e controles na ordem definida', () => {
        const expectedGroups = [
            { id: 'fontes', title: 'Fontes', tokens: ['headingFont', 'bodyFont', 'bodySize', 'h1Size'] },
            { id: 'cores', title: 'Cores', tokens: ['primaryColor', 'secondaryColor', 'mode', 'textColorMaster'] },
            { id: 'fundo', title: 'Fundo e textura', tokens: ['texture', 'surfaceMaterial', 'systemTone'] },
            {
                id: 'cards',
                title: 'Cards',
                tokens: ['cardVariant', 'cardTextureType', 'cardBorderRadius', 'cardBackgroundColor', 'shadowIntensity', 'borderType']
            },
            { id: 'forma', title: 'Forma e estrutura', tokens: ['btnBorderRadius', 'btnStyleType', 'navigationStyle'] }
        ] as const;
        const shuffledTokens = expectedGroups
            .flatMap(({ id, tokens }) => tokens.map((tokenId) => createImpactToken(tokenId, id)))
            .reverse();

        const { container } = render(<ThemeImpactList {...createProps(shuffledTokens)} />);
        const groups = Array.from(container.querySelectorAll<HTMLElement>('[data-visual-impact-group]'));

        expect(groups.map((group) => group.dataset.visualImpactGroup)).toEqual(
            expectedGroups.map(({ id }) => id)
        );
        expectedGroups.forEach(({ id, title, tokens }) => {
            const group = groups.find((candidate) => candidate.dataset.visualImpactGroup === id);
            expect(group).toBeDefined();
            expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
            expect(Array.from(group?.querySelectorAll<HTMLElement>('[data-visual-impact-token]') ?? [])
                .map((token) => token.dataset.visualImpactToken)).toEqual(tokens);
        });
        expect(container.querySelectorAll('[data-visual-impact-token]')).toHaveLength(20);
        const renderedControls = screen.getAllByTestId('token-control');
        expect(renderedControls).toHaveLength(20);
        renderedControls.forEach((control) => expect(control).toBeVisible());
    });

    it('omite grupos sem tokens', () => {
        const props = createProps([createImpactToken('headingFont', 'fontes')]);

        const { container } = render(<ThemeImpactList {...props} />);

        expect(container.querySelectorAll('[data-visual-impact-group]')).toHaveLength(1);
        expect(screen.getByRole('heading', { name: 'Fontes' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Cores' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Fundo e textura' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Cards' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Forma e estrutura' })).not.toBeInTheDocument();
    });
});
