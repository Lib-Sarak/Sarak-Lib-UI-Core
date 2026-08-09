import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../DynamicRenderer';
import { DynamicRenderer } from '../DynamicRenderer';
import { VisualContract } from '../types';

describe('DynamicRenderer', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // Caracterização (R10 — lote 10): a barra de abas só aparece com >1 `tab` distinto
    // entre os contratos — sem isso o teste "passa" sem exercitar o botão nativo.
    describe('barra de abas (contracts com tab distinto)', () => {
        const CONTRACTS: VisualContract[] = [
            { id: 'c1', type: 'CUSTOM', label: 'Um', endpoint: '/a', tab: 'Geral', component: 'PainelUm' },
            { id: 'c2', type: 'CUSTOM', label: 'Dois', endpoint: '/b', tab: 'Avançado', component: 'PainelDois' },
        ];

        it('renderiza um botão por aba e troca o contrato exibido ao clicar', () => {
            render(<DynamicRenderer contracts={CONTRACTS} />);
            expect(screen.getByRole('button', { name: 'Geral' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Avançado' })).toBeInTheDocument();
            expect(screen.getByText(/PainelUm/)).toBeInTheDocument();
            fireEvent.click(screen.getByRole('button', { name: 'Avançado' }));
            expect(screen.getByText(/PainelDois/)).toBeInTheDocument();
        });
    });
});
