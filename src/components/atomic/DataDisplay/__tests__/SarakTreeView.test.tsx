import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakTreeView, type MatrixTreeNode } from '../SarakTreeView';

const renderTree = (props: React.ComponentProps<typeof SarakTreeView>) =>
    render(
        <SarakUIProvider>
            <SarakTreeView {...props} />
        </SarakUIProvider>,
    );

describe('Spec 12 (Onda 9) — SarakTreeView: árvore hierárquica', () => {
    it('renderiza os nós-raiz e expõe a semântica de árvore (role=tree/treeitem)', () => {
        renderTree({ data: [{ id: 'r1', name: 'Raiz 1' }, { id: 'r2', name: 'Raiz 2' }] });
        expect(screen.getByRole('tree')).toBeInTheDocument();
        expect(screen.getAllByRole('treeitem')).toHaveLength(2);
        expect(screen.getByText('Raiz 1')).toBeInTheDocument();
    });

    it('suporta profundidade (N níveis): expandir um nó revela os filhos', () => {
        const data: MatrixTreeNode[] = [
            { id: 'root', name: 'Root', children: [{ id: 'child', name: 'Filho' }] },
        ];
        renderTree({ data });

        expect(screen.queryByText('Filho')).toBeNull();
        fireEvent.click(screen.getByText('Root'));
        expect(screen.getByText('Filho')).toBeInTheDocument();
    });

    it('exibe o lazyLoadingIcon sob um nó com loading: true (ativável via JSON)', () => {
        const data: MatrixTreeNode[] = [{ id: 'async', name: 'Assíncrono', loading: true }];
        renderTree({
            data,
            manifest: { default: { hasExpand: true, defaultExpanded: true } },
            lazyLoadingIcon: <span data-testid="spinner">Buscando…</span>,
        });
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
});
