import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakKanban } from '../SarakKanban';
import * as barrel from '../index';

const columns = [{ id: 'todo', title: 'A fazer', cards: [{ id: 'a', title: 'Tarefa A' }] }];

describe('SarakKanban — fronteira lazy', () => {
    it('renderiza SEM Suspense do consumidor: primeiro o estado de carga, depois o quadro', async () => {
        render(<SarakKanban columns={columns} />);
        expect(screen.getByRole('status')).toHaveTextContent('Carregando quadro');
        expect(await screen.findByText('Tarefa A')).toBeInTheDocument();
        expect(document.querySelector('[data-sarak-kanban-loading]')).toBeNull();
    });

    it('o barril exporta o componente e a lógica pura fora da fronteira lazy', () => {
        expect(barrel.SarakKanban).toBe(SarakKanban);
        expect(typeof barrel.sarakMoveCard).toBe('function');
    });
});
