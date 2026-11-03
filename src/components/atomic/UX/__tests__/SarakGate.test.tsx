import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakGate } from '../SarakGate';

describe('SarakGate', () => {
    it('mostra os filhos quando permitido', () => {
        render(<SarakGate allowed fallback={<p>negado</p>}><p>conteúdo</p></SarakGate>);

        expect(screen.getByText('conteúdo')).toBeInTheDocument();
        expect(screen.queryByText('negado')).not.toBeInTheDocument();
    });

    it('mostra o fallback quando não permitido', () => {
        render(<SarakGate allowed={false} fallback={<p>negado</p>}><p>conteúdo</p></SarakGate>);

        expect(screen.getByText('negado')).toBeInTheDocument();
        expect(screen.queryByText('conteúdo')).not.toBeInTheDocument();
    });

    it('sem fallback, não deixa nada no lugar', () => {
        const { container } = render(<SarakGate allowed={false}><p>conteúdo</p></SarakGate>);

        expect(container).toBeEmptyDOMElement();
    });
});
