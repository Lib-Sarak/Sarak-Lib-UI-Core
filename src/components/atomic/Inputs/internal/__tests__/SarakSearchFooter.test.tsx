import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { SarakSearchFooter } from '../SarakSearchFooter';

describe('SarakSearchFooter', () => {
    it('mostra dicas de teclado e identifica o mecanismo de busca', () => {
        render(
            <SarakUIProvider>
                <SarakSearchFooter systemName="Portal" />
            </SarakUIProvider>,
        );

        expect(screen.getByText('ESC')).toBeInTheDocument();
        expect(screen.getByText('↑↓')).toBeInTheDocument();
        expect(screen.getByText('Portal Motor de Busca')).toBeInTheDocument();
    });
});
