import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakCardFooter } from '../SarakCardFooter';

describe('SarakCardFooter', () => {
    it('renderiza o conteúdo dentro de um rodapé', () => {
        render(<SarakCardFooter>Ações</SarakCardFooter>);

        expect(screen.getByText('Ações').closest('footer')).not.toBeNull();
    });
});
