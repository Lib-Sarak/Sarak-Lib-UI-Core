import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakDataTableSkeleton } from '../SarakDataTableSkeleton';

describe('SarakDataTableSkeleton', () => {
    it('desenha 8 linhas por padrão, uma célula por coluna, com texto só para leitor de tela', () => {
        const { container } = render(<SarakDataTableSkeleton columns={3} />);
        const rows = container.querySelectorAll('.animate-pulse');
        expect(rows).toHaveLength(8);
        expect(rows[0].children).toHaveLength(3);
        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByText('Carregando')).toHaveClass('sr-only');
    });

    it('respeita rows e garante ao menos uma célula', () => {
        const { container } = render(<SarakDataTableSkeleton columns={0} rows={2} />);
        const rows = container.querySelectorAll('.animate-pulse');
        expect(rows).toHaveLength(2);
        expect(rows[0].children).toHaveLength(1);
    });
});
