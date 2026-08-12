import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { InputsCatalog } from '../InputsCatalog';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('InputsCatalog', () => {
    it('renderiza a grade de presets de Inputs', () => {
        render(<InputsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getByText('Classic Underline')).toBeInTheDocument();
    });

    it('a grade reage a CONTAINER QUERY (@min-[768px]:/@min-[1024px]:), não mais a `md:`/`lg:` de viewport (plan-35)', () => {
        const { container } = render(<InputsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const grid = container.querySelector('.grid') as HTMLElement;
        expect(grid.className).not.toMatch(/\bmd:grid-cols-2\b/);
        expect(grid.className).not.toMatch(/\blg:grid-cols-3\b/);
        expect(grid.className).toMatch(/@min-\[768px\]:grid-cols-2/);
        expect(grid.className).toMatch(/@min-\[1024px\]:grid-cols-3/);
    });
});
