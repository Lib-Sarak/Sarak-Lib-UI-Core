import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakTableSortButton } from '../SarakTableSortButton';

describe('SarakTableSortButton', () => {
    it('envia a coluna escolhida e expõe seu propósito por acessibilidade', () => {
        const onSort = vi.fn();
        render(
            <SarakTableSortButton
                columnId="name"
                label="Nome"
                sort={{ columnId: 'name', direction: 'asc' }}
                onSort={onSort}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por name' }));

        expect(onSort).toHaveBeenCalledWith('name');
        expect(screen.getByText('Nome')).toBeInTheDocument();
    });
});
