import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakCardHeader } from '../SarakCardHeader';

describe('SarakCardHeader', () => {
    it('renderiza o conteúdo dentro de um cabeçalho e aceita classes adicionais', () => {
        render(<SarakCardHeader className="text-left">Título</SarakCardHeader>);

        expect(screen.getByText('Título').closest('header')).toHaveClass('text-left');
    });
});
