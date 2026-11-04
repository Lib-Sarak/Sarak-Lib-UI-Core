import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Cada opção desenha componentes reais (botão em 4 estados, campo, cartão): a lista inteira em jsdom passa dos 5 s padrão sob carga.
vi.setConfig({ testTimeout: 30000 });
import { ButtonsCatalog } from '../ButtonsCatalog';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

// Cada opção desenha o botão real em quatro estados; sob a suíte inteira em paralelo a lista passa dos 5 s padrão.
const HEAVY_RENDER_TIMEOUT_MS = 30000;

describe('ButtonsCatalog', () => {
    it('renderiza a aba Curados por padrão', () => {
        render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getAllByText('Fosco industrial')[0]).toBeInTheDocument();
    });

    it('troca para a camada automática Por Estilo e cobre o gap do borderline', () => {
        render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        fireEvent.click(screen.getByRole('button', { name: /Por Estilo/i }));
        expect(screen.getAllByText('Contorno')[0]).toBeInTheDocument();
    }, HEAVY_RENDER_TIMEOUT_MS);

    it('a grade reage a CONTAINER QUERY (@min-[768px]:/@min-[1024px]:), não mais a `md:`/`lg:` de viewport (plan-35)', () => {
        const { container } = render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const grid = container.querySelector('.grid') as HTMLElement;
        expect(grid.className).not.toMatch(/\bmd:grid-cols-2\b/);
        expect(grid.className).not.toMatch(/\blg:grid-cols-3\b/);
        expect(grid.className).toMatch(/@min-\[768px\]:grid-cols-2/);
        expect(grid.className).toMatch(/@min-\[1024px\]:grid-cols-3/);
    });
});
