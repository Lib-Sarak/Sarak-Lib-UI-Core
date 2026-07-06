import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    it('renderiza a aba Curados por padrão e faz snapshot', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getByText('Glass Minimal')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it('troca para a camada automática de Texturas ao clicar na sub-aba', () => {
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        fireEvent.click(screen.getByRole('button', { name: /Texturas/i }));
        expect(screen.getByText('Grid Técnico')).toBeInTheDocument();
    });
});
