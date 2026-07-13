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

    it('deve resolver os átomos de densidade da Onda 9 (Spec 12) como nativos, não fallback', () => {
        const registry = createComponentRegistry();
        const densityTypes = ['SarakDataTable', 'SarakSparkline', 'SarakTreeView'] as const;
        for (const type of densityTypes) {
            const { isFallback, Component } = registry.resolve(type);
            expect(isFallback).toBe(false);
            expect(Component).toBe(NATIVE_COMPONENTS[type]);
        }
    });

    it('deve resolver os componentes pesados da Onda 10 (Specs 15/12/11) como nativos', () => {
        const registry = createComponentRegistry();
        const onda10 = ['SarakPDFViewer', 'SarakKanban', 'SarakRichText', 'SarakMarkdownRenderer', 'SarakLightbox'] as const;
        for (const type of onda10) {
            const { isFallback, Component } = registry.resolve(type);
            expect(isFallback).toBe(false);
            expect(Component).toBe(NATIVE_COMPONENTS[type]);
        }
    });

    it('deve resolver os átomos fundamentais (Botão/Texto/Ícone/Cards/Templates) como nativos (regressão)', () => {
        // Regressão: `SarakButton`/`SarakTypography` caíam no fallback ("Componente
        // desconhecido") porque nunca tinham sido registrados aqui, apesar de existirem
        // no código-fonte e/ou serem exportados publicamente.
        const registry = createComponentRegistry();
        const atomosFundamentais = [
            'SarakButton',
            'SarakIconButton',
            'SarakTypography',
            'SarakIcon',
            'SarakSearch',
            'ExpandableCard',
            'SarakActionCard',
            'SarakEmptyState',
            'SarakBadge',
            'SarakTable',
            'SarakForm',
            'SarakChart',
            'SarakAuthScreen',
        ] as const;
        for (const type of atomosFundamentais) {
            const { isFallback, Component } = registry.resolve(type);
            expect(isFallback).toBe(false);
            expect(Component).toBe(NATIVE_COMPONENTS[type]);
        }
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
