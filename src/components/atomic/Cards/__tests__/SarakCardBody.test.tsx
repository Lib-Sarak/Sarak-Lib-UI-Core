import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakCardBody } from '../SarakCardBody';

describe('SarakCardBody', () => {
    it('renderiza o conteúdo dentro da área do corpo', () => {
        render(<SarakCardBody>Descrição</SarakCardBody>);

        expect(screen.getByText('Descrição').parentElement?.tagName).toBe('DIV');
    });
});
