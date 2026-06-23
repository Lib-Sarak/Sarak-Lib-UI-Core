import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { mergeResponsiveProps } from '../useResponsiveProps';
import { SarakManifestRenderer } from '../../SarakManifestRenderer';
import { createComponentRegistry, type ComponentRegistry } from '../../Registry/ComponentRegistry';
import { DeviceProvider, type DeviceType } from '../../../Provider/DeviceProvider';
import type { ManifestRoot, ResponsiveDirective } from '../../types';

const responsive: ResponsiveDirective = {
    mob: { padding: 's' },
    tab: { padding: 'm' },
    desk: { padding: 'xl' },
};

describe('Spec 16 — mergeResponsiveProps (cascata mobile-first)', () => {
    it('mobile usa só a camada mob', () => {
        expect(mergeResponsiveProps({ padding: 'base' }, responsive, 'smartphone')).toEqual({ padding: 's' });
    });

    it('tablet sobrepõe mob com tab', () => {
        expect(mergeResponsiveProps({ padding: 'base' }, responsive, 'tablet')).toEqual({ padding: 'm' });
    });

    it('desktop sobrepõe até desk (mob → tab → desk)', () => {
        expect(mergeResponsiveProps({ padding: 'base' }, responsive, 'desktop')).toEqual({ padding: 'xl' });
    });

    it('camada ausente herda a anterior (desk sem tab/desk fica no mob)', () => {
        const sparse: ResponsiveDirective = { mob: { padding: 's' } };
        expect(mergeResponsiveProps({}, sparse, 'desktop')).toEqual({ padding: 's' });
    });

    it('preserva props base não sobrescritas pela camada', () => {
        expect(mergeResponsiveProps({ id: 'x', padding: 'base' }, responsive, 'desktop')).toEqual({
            id: 'x',
            padding: 'xl',
        });
    });

    it('sem diretiva, devolve a referência base intacta', () => {
        const base = { padding: 'base' };
        expect(mergeResponsiveProps(base, undefined, 'desktop')).toBe(base);
    });
});

// Átomo de teste: ecoa o `padding` recebido e nunca deveria ver a chave `responsive`.
const Box: React.FC<{ padding?: string; 'data-testid'?: string }> = ({ padding, ...rest }) => (
    <div {...rest} data-padding={padding} />
);

const makeRegistry = (): ComponentRegistry => {
    const registry = createComponentRegistry();
    registry.register('Box', Box);
    return registry;
};

const renderAt = (device: DeviceType) => {
    const manifest: ManifestRoot = {
        schemaVersion: 1,
        type: 'Box',
        props: { 'data-testid': 'box', padding: 'base' },
        responsive,
    };
    return render(
        <DeviceProvider overrideDevice={device}>
            <SarakManifestRenderer manifest={manifest} registry={makeRegistry()} />
        </DeviceProvider>,
    );
};

describe('Spec 16 — diretiva responsive no Renderer', () => {
    it('aplica o padding do breakpoint ativo (desktop → xl)', () => {
        renderAt('desktop');
        expect(screen.getByTestId('box')).toHaveAttribute('data-padding', 'xl');
    });

    it('aplica o padding do breakpoint ativo (mobile → s)', () => {
        renderAt('smartphone');
        expect(screen.getByTestId('box')).toHaveAttribute('data-padding', 's');
    });

    it('a diretiva responsive jamais vaza como atributo no DOM', () => {
        renderAt('desktop');
        expect(screen.getByTestId('box')).not.toHaveAttribute('responsive');
    });
});
