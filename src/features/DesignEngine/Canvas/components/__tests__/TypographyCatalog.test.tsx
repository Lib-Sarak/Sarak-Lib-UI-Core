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
    it('renderiza o título do catálogo e presets', () => {
        render(<TypographyCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getByText('Pilar: Typography & Fonts')).toBeInTheDocument();
        expect(screen.getAllByText('The quick brown fox jumps over the lazy dog')[0]).toBeInTheDocument();
    });
});
