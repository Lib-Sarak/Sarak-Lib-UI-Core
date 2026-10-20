import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as ComponentModule from '../SarakCatalogGrid';
import { SarakCatalogGrid } from '../SarakCatalogGrid';

describe('SarakCatalogGrid', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: `headerLayout`/`gridLayout`/`searchRow` usam classe `@min-[…]`
    // (container query), que só ativa com um ancestral `container-type`. jsdom não
    // avalia container query — prova só que a raiz PLANTA `@container` (a query casar
    // é prova de browser real, plan-40).
    it('planta @container na raiz — ancestral do grid, do cabeçalho e da fileira de busca', () => {
        const { container } = render(<SarakCatalogGrid items={[]} title="Catálogo" />);

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });

    it('usa a classe arbitrária de cor de borda sem o sufixo inválido', () => {
        const { container } = render(<SarakCatalogGrid items={[]} title="Catálogo" />);
        const summary = screen.getByText('0 Itens encontrados').parentElement as HTMLElement;
        const emptyState = container.querySelector('[class*="border-dashed"]') as HTMLElement;

        expect(summary.className).toContain('border-[var(--border-color,rgba(255,255,255,0.09))]');
        expect(emptyState.className).toContain('border-[var(--border-color,rgba(255,255,255,0.09))]');
        expect(summary.className).not.toContain(')-border');
        expect(emptyState.className).not.toContain(')-border');
    });

    it('usa a cor primária translúcida na borda do indicador de carregamento', () => {
        const { container } = render(<SarakCatalogGrid items={[]} title="Catálogo" loading />);
        const spinner = container.querySelector('.animate-spin') as HTMLElement;

        expect(spinner.className).toContain('border-theme-primary/10');
        expect(spinner.className).not.toContain(')-primary/10');
    });
});
