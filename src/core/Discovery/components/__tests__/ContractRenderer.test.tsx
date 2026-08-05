import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

/**
 * Caracterização do ContractRenderer (Spec 65 / batch alto risco).
 * Trava o roteamento do `switch (type)` e a passagem dos props-chave ANTES da
 * tipagem dos `any`. Os componentes pesados são mocados (sem fetch/lazy real);
 * cada mock vira um marcador `data-testid` que ecoa props escalares relevantes.
 */

// Barrel de templates: preserva os exports reais (importOriginal) e sobrescreve
// apenas os componentes que este teste renderiza, virando marcadores `data-testid`.
vi.mock('../../../../components/atomic/Templates', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    const ReactMod = await import('react');
    const make = (name: string) => (props: Record<string, unknown>) =>
        ReactMod.createElement('div', {
            'data-testid': name,
            'data-endpoint': (props.endpoint as string) ?? '',
            'data-label': (props.label as string) ?? '',
            'data-username': (props.username as string) ?? '',
            'data-items-len': Array.isArray(props.items) ? String(props.items.length) : '',
            'data-groupby': (props.groupBy as string) ?? '',
        });
    return {
        ...actual,
        SarakTable: make('SarakTable'),
        SarakCardGrid: make('SarakCardGrid'),
        SarakStats: make('SarakStats'),
        SarakChart: make('SarakChart'),
        SarakForm: make('SarakForm'),
        SarakManagementGrid: make('SarakManagementGrid'),
        SarakChat: make('SarakChat'),
        SarakAuthScreen: make('SarakAuthScreen'),
        SarakCatalogGrid: make('SarakCatalogGrid'),
    };
});

vi.mock('../SarakExpandableMatrixEngine', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    const ReactMod = await import('react');
    return {
        ...actual,
        SarakExpandableMatrixEngine: () =>
            ReactMod.createElement('div', { 'data-testid': 'SarakExpandableMatrixEngine' }),
    };
});

import { ContractRenderer } from '../ContractRenderer';
import type { VisualContract } from '../../types';

const renderType = (extra: Record<string, unknown>, module?: unknown) => {
    const contract = { id: 'c1', label: 'My Card', endpoint: '/v1/data', ...extra } as unknown as VisualContract;
    render(
        <ContractRenderer
            contractsToRender={[contract]}
            resolveEndpoint={(e) => `RESOLVED:${e}`}
            module={module as never}
        />,
    );
};

describe('ContractRenderer — roteamento por type', () => {
    it('TABLE → SarakTable com endpoint resolvido', () => {
        renderType({ type: 'TABLE' });
        const el = screen.getByTestId('SarakTable');
        expect(el).toBeInTheDocument();
        expect(el.getAttribute('data-endpoint')).toBe('RESOLVED:/v1/data');
        expect(el.getAttribute('data-label')).toBe('My Card');
    });

    it('CARD_GRID → SarakCardGrid', () => {
        renderType({ type: 'CARD_GRID' });
        expect(screen.getByTestId('SarakCardGrid')).toBeInTheDocument();
    });

    it('MANAGEMENT_GRID → SarakManagementGrid com groupBy', () => {
        renderType({ type: 'MANAGEMENT_GRID', groupBy: 'status' });
        const el = screen.getByTestId('SarakManagementGrid');
        expect(el.getAttribute('data-groupby')).toBe('status');
    });

    it('STATS → SarakStats', () => {
        renderType({ type: 'STATS' });
        expect(screen.getByTestId('SarakStats')).toBeInTheDocument();
    });

    it('CHART → SarakChart', () => {
        renderType({ type: 'CHART' });
        expect(screen.getByTestId('SarakChart')).toBeInTheDocument();
    });

    it('FORM → SarakForm', () => {
        renderType({ type: 'FORM' });
        expect(screen.getByTestId('SarakForm')).toBeInTheDocument();
    });

    it('CHAT_INTERFACE → SarakChat', () => {
        renderType({ type: 'CHAT_INTERFACE' });
        expect(screen.getByTestId('SarakChat')).toBeInTheDocument();
    });

    it('AUTH_FLOW → SarakAuthScreen e repassa campos enriquecidos (username)', () => {
        renderType({ type: 'AUTH_FLOW', username: 'neo', onSubmit: () => {} });
        const el = screen.getByTestId('SarakAuthScreen');
        expect(el.getAttribute('data-username')).toBe('neo');
    });

    it('CATALOG_GRID → SarakCatalogGrid e repassa items', () => {
        renderType({ type: 'CATALOG_GRID', items: [{ x: 1 }, { x: 2 }] });
        const el = screen.getByTestId('SarakCatalogGrid');
        expect(el.getAttribute('data-items-len')).toBe('2');
    });

    it('EXPANDABLE_MATRIX → SarakExpandableMatrixEngine', () => {
        renderType({ type: 'EXPANDABLE_MATRIX' });
        expect(screen.getByTestId('SarakExpandableMatrixEngine')).toBeInTheDocument();
    });

    it('CUSTOM com componente no módulo → renderiza o customizado', () => {
        const Custom = () => <div data-testid="custom-comp" />;
        renderType(
            { type: 'CUSTOM', component: 'Foo', config: { p: 1 } },
            { id: 'm1', components: { Foo: Custom } },
        );
        expect(screen.getByTestId('custom-comp')).toBeInTheDocument();
    });

    it('CUSTOM sem componente → mensagem "not found"', () => {
        renderType({ type: 'CUSTOM', component: 'Missing' }, { id: 'm1' });
        expect(screen.getByText(/not found in module registration/i)).toBeInTheDocument();
    });

    it('type desconhecido → mensagem "not recognized"', () => {
        renderType({ type: 'WEIRD_TYPE' });
        expect(screen.getByText(/not recognized by UI-Core/i)).toBeInTheDocument();
    });
});
