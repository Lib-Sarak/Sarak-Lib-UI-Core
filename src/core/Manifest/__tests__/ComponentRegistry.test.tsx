import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    createComponentRegistry,
    registerComponent,
    resolveComponent,
    type ComponentType,
} from '../Registry/ComponentRegistry';
import { NATIVE_COMPONENTS } from '../Registry/nativeComponents';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';

describe('Spec 22 — ComponentRegistry', () => {
    it('deve resolver um type nativo conhecido para o componente correto', () => {
        const registry = createComponentRegistry();
        const { Component, isFallback } = registry.resolve('SarakFlex');
        expect(isFallback).toBe(false);
        expect(Component).toBe(NATIVE_COMPONENTS.SarakFlex);
    });

    it('deve devolver o fallback (sem lançar) para type desconhecido e logar o nó culpado', () => {
        const registry = createComponentRegistry();
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const { isFallback, Component } = registry.resolve('Inexistente', 'no-42');

        expect(isFallback).toBe(true);
        expect(Component).toBe(registry.getFallback());
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('Inexistente');
        expect(warn.mock.calls[0][0]).toContain('no-42');
        warn.mockRestore();
    });

    it('deve renderizar o fallback visual sem quebrar a página', () => {
        const registry = createComponentRegistry();
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { Component } = registry.resolve('Fantasma', 'ghost-1');

        render(
            <SarakUIProvider>
                <Component type="Fantasma" nodeId="ghost-1" />
            </SarakUIProvider>,
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Fantasma/)).toBeInTheDocument();
    });

    it('deve incorporar um componente customizado registrado pelo importador', () => {
        const registry = createComponentRegistry();
        const Custom: React.FC<{ label?: string }> = ({ label }) => <div>{label}</div>;

        expect(registry.has('MeuCustom')).toBe(false);
        registry.register('MeuCustom', Custom);
        expect(registry.has('MeuCustom')).toBe(true);

        const { isFallback, Component } = registry.resolve('MeuCustom');
        expect(isFallback).toBe(false);
        expect(Component).toBe(Custom);
    });

    it('deve expor registerComponent/resolveComponent operando no registry padrão', () => {
        const Custom: React.FC = () => <span>custom</span>;
        registerComponent('GlobalCustom', Custom);
        const { isFallback } = resolveComponent('GlobalCustom');
        expect(isFallback).toBe(false);
    });
});

describe('Spec 22 — ComponentType (tipagem fechada)', () => {
    it('deve aceitar, em compile-time, apenas types nativos conhecidos', () => {
        // Estas atribuições compilam por serem types válidos da união.
        const valid: ComponentType[] = ['SarakFlex', 'SarakGrid', 'SarakTabs'];
        expect(valid).toHaveLength(3);

        // @ts-expect-error — "TipoInexistente" não pertence à união ComponentType.
        const invalid: ComponentType = 'TipoInexistente';
        expect(invalid).toBe('TipoInexistente');
    });
});
