import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakTypography } from '../SarakTypography';

describe('SarakTypography', () => {
    it('renderiza `body` como <p> por padrão', () => {
        render(<SarakTypography>Olá</SarakTypography>);
        const el = screen.getByText('Olá');
        expect(el.tagName).toBe('P');
    });

    it('mapeia cada variant para a tag semântica correta', () => {
        const { rerender } = render(<SarakTypography variant="h1">Título</SarakTypography>);
        expect(screen.getByText('Título').tagName).toBe('H1');

        rerender(<SarakTypography variant="h2">Título</SarakTypography>);
        expect(screen.getByText('Título').tagName).toBe('H2');

        rerender(<SarakTypography variant="caption">Nota</SarakTypography>);
        expect(screen.getByText('Nota').tagName).toBe('SPAN');

        rerender(<SarakTypography variant="mono">code</SarakTypography>);
        expect(screen.getByText('code').tagName).toBe('CODE');
    });

    it('`as` sobrepõe a tag default do variant', () => {
        render(
            <SarakTypography variant="h1" as="span">
                Título
            </SarakTypography>,
        );
        expect(screen.getByText('Título').tagName).toBe('SPAN');
    });

    it('aplica a cor via variável CSS correspondente ao `color`', () => {
        render(
            <SarakTypography color="muted" data-testid="muted-text">
                Texto
            </SarakTypography>,
        );
        const el = screen.getByTestId('muted-text');
        expect(el.style.color).toContain('--sarak-text-muted');
    });

    it('`content` (canal de manifesto) tem prioridade sobre `children`', () => {
        // O Manifest Engine só entrega texto via prop (Spec 22/24) — `children` nunca
        // chega como string crua nesse caminho (só como nós filhos aninhados).
        render(<SarakTypography content="Do manifesto">Do TSX direto</SarakTypography>);
        expect(screen.getByText('Do manifesto')).toBeInTheDocument();
        expect(screen.queryByText('Do TSX direto')).not.toBeInTheDocument();
    });
});
