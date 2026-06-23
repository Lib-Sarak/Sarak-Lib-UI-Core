import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SarakMarkdownRendererImpl from '../SarakMarkdownRendererImpl';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

// Importa o Impl direto (sem a fronteira lazy) — teste de unidade colocado ao componente.
const renderMd = (content: string) =>
    render(
        <SarakUIProvider>
            <SarakMarkdownRendererImpl content={content} />
        </SarakUIProvider>,
    );

describe('SarakMarkdownRendererImpl (Spec 15, Regra 1)', () => {
    it('traduz Markdown em elementos estilizados (título vira heading semântico)', () => {
        renderMd('# Olá\n\nUm parágrafo.');
        expect(screen.getByText('Olá').tagName).toBe('H1');
        expect(screen.getByText('Um parágrafo.')).toBeInTheDocument();
    });

    it('neutraliza URL `javascript:` num link (Spec 40)', () => {
        renderMd('[clique](javascript:alert(1))');
        expect((screen.getByText('clique').getAttribute('href') ?? '')).not.toMatch(/javascript:/i);
    });

    it('não executa `<script>` embutido — tratado como texto, sem nó <script>', () => {
        const { container } = renderMd('antes <script>alert(1)</script> depois');
        expect(container.querySelector('script')).toBeNull();
    });

    it('renderiza bloco de código e expõe o modo do tema (dark/light) no contêiner', () => {
        const { container } = renderMd('```js\nconst x = 1;\n```');
        const root = container.querySelector('.sarak-markdown');
        expect(root?.getAttribute('data-mode')).toMatch(/^(dark|light)$/);
        expect(root?.textContent).toContain('const x = 1');
    });

    it('imagem usa max-width 100% (não deforma o layout — Critério E2E)', () => {
        renderMd('![alt](foto.jpg)');
        expect(screen.getByRole('img').className).toContain('max-w-full');
    });
});
