import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { CardsCatalog } from '../CardsCatalog';

vi.mock('../../../../../core/Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn(() => ({ variables: {}, attributes: {} }))
}));

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('CardsCatalog', () => {
    it('renderiza o título do catálogo', () => {
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getByText('Pilar: Cards & Surfaces')).toBeInTheDocument();
    });
});
