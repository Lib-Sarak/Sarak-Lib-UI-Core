import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakGrid } from '../SarakGrid';
import { SarakGridItem } from '../SarakGridItem';
import { SarakDeviceProvider, type SarakDeviceType } from '../../../../core/Provider/DeviceProvider';

const renderAt = (device: SarakDeviceType, ui: React.ReactElement) =>
    render(<SarakDeviceProvider overrideDevice={device}>{ui}</SarakDeviceProvider>);

const SPAN = { mob: 'full', tab: 6, desk: 8 } as const;
const gridColumnOf = (testId: string): string => screen.getByTestId(testId).style.gridColumn;
const gridOf = (container: HTMLElement): HTMLElement =>
    container.querySelector('[style*="grid-template-columns"]') as HTMLElement;

describe('SarakGridItem — ocupação de coluna por dispositivo', () => {
    it.each([
        ['smartphone', '1 / -1'],
        ['tablet', 'span 6 / span 6'],
        ['desktop', 'span 8 / span 8'],
    ] as const)('em %s resolve o span responsivo para %s', (device, expected) => {
        renderAt(device, (
            <SarakGrid columns={{ mob: 1, tab: 6, desk: 12 }}>
                <SarakGridItem span={SPAN} data-testid="item">x</SarakGridItem>
            </SarakGrid>
        ));
        expect(gridColumnOf('item')).toBe(expected);
    });

    it('span fixo vale no desktop, e "full" ocupa a linha toda', () => {
        renderAt('desktop', (
            <SarakGrid columns={12}>
                <SarakGridItem span={4} data-testid="fixo">a</SarakGridItem>
                <SarakGridItem span="full" data-testid="cheio">b</SarakGridItem>
            </SarakGrid>
        ));
        expect(gridColumnOf('fixo')).toBe('span 4 / span 4');
        expect(gridColumnOf('cheio')).toBe('1 / -1');
    });

    it('no celular, span maior que as colunas do grid vira a linha toda', () => {
        renderAt('smartphone', (
            <SarakGrid columns={12}>
                <SarakGridItem span={6} data-testid="item">x</SarakGridItem>
            </SarakGrid>
        ));
        expect(gridColumnOf('item')).toBe('1 / -1');
    });

    it('fora de um grid com columns, no celular, span > 1 vira a linha toda', () => {
        renderAt('smartphone', <SarakGridItem span={3} data-testid="item">x</SarakGridItem>);
        expect(gridColumnOf('item')).toBe('1 / -1');
    });

    it('sem span, o item não declara grid-column (fluxo normal de uma trilha)', () => {
        renderAt('desktop', <SarakGridItem data-testid="item">x</SarakGridItem>);
        expect(gridColumnOf('item')).toBe('');
    });

    it('rowSpan por dispositivo e elemento trocado por "as"', () => {
        renderAt('tablet', (
            <SarakGridItem as="section" rowSpan={{ mob: 1, tab: 2, desk: 3 }} data-testid="item">x</SarakGridItem>
        ));
        const item = screen.getByTestId('item');
        expect(item.tagName).toBe('SECTION');
        expect(item.style.gridRow).toBe('span 2 / span 2');
    });
});

describe('SarakGrid — columns declarativo', () => {
    it.each([
        ['smartphone', 'repeat(1, minmax(0, 1fr))'],
        ['tablet', 'repeat(6, minmax(0, 1fr))'],
        ['desktop', 'repeat(12, minmax(0, 1fr))'],
    ] as const)('em %s emite %s', (device, expected) => {
        const { container } = renderAt(device, (
            <SarakGrid columns={{ mob: 1, tab: 6, desk: 12 }}><div>a</div></SarakGrid>
        ));
        expect(gridOf(container).style.gridTemplateColumns).toBe(expected);
    });

    it('vence templateColumns quando os dois vêm', () => {
        const { container } = renderAt('desktop', (
            <SarakGrid columns={3} templateColumns="1fr 2fr"><div>a</div></SarakGrid>
        ));
        expect(gridOf(container).style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
    });
});
