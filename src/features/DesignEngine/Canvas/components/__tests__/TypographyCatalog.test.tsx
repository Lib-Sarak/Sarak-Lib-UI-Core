import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { TypographyCatalog } from '../TypographyCatalog';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('TypographyCatalog', () => {
    it('renderiza os presets de tipografia', () => {
        render(<TypographyCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getAllByText('The quick brown fox jumps over the lazy dog')[0]).toBeInTheDocument();
    });

    it('a grade reage a CONTAINER QUERY (@min-[768px]:), não mais a `md:` de viewport (plan-35)', () => {
        const { container } = render(<TypographyCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const grid = container.querySelector('.grid') as HTMLElement;
        expect(grid.className).not.toMatch(/\bmd:grid-cols-2\b/);
        expect(grid.className).toMatch(/@min-\[768px\]:grid-cols-2/);
    });
});
