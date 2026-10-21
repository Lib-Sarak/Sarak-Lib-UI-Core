import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { ChromeContentRegion } from '../ChromeContentRegion';

describe('ChromeContentRegion', () => {
    it('renderiza os dois painéis quando o token e o slot estão ativos', () => {
        const { container, getByText } = render(
            <ChromeContentRegion
                isSplitViewEnabled
                className="flex-1"
                style={{}}
                secondaryContent={<span>Painel secundário</span>}
            >
                <span>Painel principal</span>
            </ChromeContentRegion>,
        );
        const region = container.querySelector('main');

        expect(region).toHaveClass('@container');
        expect(getByText('Painel principal').closest('[data-sarak-split-panel="primary"]')).not.toBeNull();
        expect(getByText('Painel secundário').closest('[data-sarak-split-panel="secondary"]')).toHaveAttribute(
            'data-sarak-slot',
            'secondaryContent',
        );
    });

    it('mantém children diretos quando o token está desligado', () => {
        const { container, getByText } = render(
            <ChromeContentRegion
                isSplitViewEnabled={false}
                className="flex-1"
                style={{}}
                secondaryContent={<span>Painel secundário</span>}
            >
                <span>Painel principal</span>
            </ChromeContentRegion>,
        );
        const region = container.querySelector('main');

        expect(region).not.toHaveClass('@container');
        expect(region?.firstElementChild).toBe(getByText('Painel principal'));
        expect(region?.querySelector('[data-sarak-split-panel]')).toBeNull();
    });

    it.each([
        ['null', null],
        ['false', false],
        ['fragmento vazio', <></>],
    ])('mantém children diretos quando o slot é %s', (_description, secondaryContent) => {
        const { container, getByText } = render(
            <ChromeContentRegion
                isSplitViewEnabled
                className="flex-1"
                style={{}}
                secondaryContent={secondaryContent}
            >
                <span>Painel principal</span>
            </ChromeContentRegion>,
        );
        const region = container.querySelector('main');

        expect(region).not.toHaveClass('@container');
        expect(region?.firstElementChild).toBe(getByText('Painel principal'));
        expect(region?.querySelector('[data-sarak-split-panel]')).toBeNull();
    });
});
