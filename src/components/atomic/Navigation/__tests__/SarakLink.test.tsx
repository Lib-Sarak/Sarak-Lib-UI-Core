import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SarakLink, isSafeLinkHref } from '../SarakLink';

describe('SarakLink (átomo de link acessível)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('renderiza um `<a>` com o href informado quando o esquema é seguro', () => {
        render(<SarakLink href="/clientes">Clientes</SarakLink>);
        expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('href', '/clientes');
    });

    it('link interno (default) não recebe `target`/`rel`', () => {
        render(<SarakLink href="/clientes">Clientes</SarakLink>);
        const link = screen.getByRole('link', { name: 'Clientes' });
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
    });

    it('link externo abre em nova aba com `rel="noreferrer noopener"` e indica a11y', () => {
        render(
            <SarakLink href="https://exemplo.com" external>
                Site externo
            </SarakLink>
        );
        const link = screen.getByRole('link', { name: /Site externo/ });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noreferrer noopener');
        expect(screen.getByText('(abre em nova aba)', { exact: false })).toBeInTheDocument();
    });

    it('bloqueia `javascript:` — não define `href` (deixa de ser um link acessível) e emite aviso', () => {
        render(<SarakLink href="javascript:alert(1)">Malicioso</SarakLink>);
        // `<a>` sem `href` não tem role `link` implícito (ARIA) — é exatamente o
        // degrade esperado: nem navegável, nem focável via Tab.
        expect(screen.queryByRole('link', { name: 'Malicioso' })).not.toBeInTheDocument();
        const anchor = screen.getByText('Malicioso');
        expect(anchor).not.toHaveAttribute('href');
        expect(anchor).toHaveAttribute('aria-disabled', 'true');
        expect(warnSpy).toHaveBeenCalled();
    });

    it('bloqueia `data:` não-seguro — não define `href`', () => {
        render(<SarakLink href="data:text/html,<script>alert(1)</script>">Malicioso</SarakLink>);
        expect(screen.queryByRole('link', { name: 'Malicioso' })).not.toBeInTheDocument();
        expect(screen.getByText('Malicioso')).not.toHaveAttribute('href');
    });

    it('aceita `mailto:`/`tel:`/âncora/relativo como esquemas seguros', () => {
        expect(isSafeLinkHref('mailto:contato@sarak.dev')).toBe(true);
        expect(isSafeLinkHref('tel:+5511999999999')).toBe(true);
        expect(isSafeLinkHref('#secao')).toBe(true);
        expect(isSafeLinkHref('/rota/interna')).toBe(true);
        expect(isSafeLinkHref('./relativo')).toBe(true);
        expect(isSafeLinkHref('https://exemplo.com/caminho?x=1')).toBe(true);
    });

    it('bloqueia esquemas de ofuscação com caracteres de controle (`java\\tscript:`)', () => {
        expect(isSafeLinkHref('java\tscript:alert(1)')).toBe(false);
    });

    it('rejeita href vazio', () => {
        expect(isSafeLinkHref('')).toBe(false);
        expect(isSafeLinkHref('   ')).toBe(false);
    });
});
