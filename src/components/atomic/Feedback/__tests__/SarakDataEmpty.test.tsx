import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakDataEmpty } from '../SarakDataEmpty';

describe('Spec 31 — SarakDataEmpty (estado vazio mínimo)', () => {
    it('renderiza a mensagem default com role=status e o data-attr', () => {
        render(<SarakDataEmpty />);
        const el = screen.getByRole('status');
        expect(el).toHaveTextContent('Nenhum dado encontrado.');
        expect(el).toHaveAttribute('data-sarak-data-empty', 'true');
    });

    it('renderiza a mensagem custom quando fornecida', () => {
        render(<SarakDataEmpty message="Sem clientes." />);
        expect(screen.getByText('Sem clientes.')).toBeInTheDocument();
    });
});
