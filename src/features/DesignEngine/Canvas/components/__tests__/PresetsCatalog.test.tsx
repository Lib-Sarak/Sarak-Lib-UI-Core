import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { PresetsCatalog } from '../PresetsCatalog';

vi.mock('../../../../../core/Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn(() => ({ variables: {}, attributes: {} }))
}));

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('PresetsCatalog', () => {
    it('renderiza o fallback de Globais por padrão', () => {
        render(<PresetsCatalog onApplyPreset={vi.fn()} activeCategory={null} currentMode="dark" />);
        expect(screen.getByText('Globais')).toBeInTheDocument();
    });

    it('renderiza o catálogo de Typography quando a categoria for typography', () => {
        render(<PresetsCatalog onApplyPreset={vi.fn()} activeCategory="typography" currentMode="dark" />);
        expect(screen.getByText('Pilar: Typography & Fonts')).toBeInTheDocument();
    });
});
