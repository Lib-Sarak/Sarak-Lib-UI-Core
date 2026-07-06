import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ButtonsCatalog } from '../ButtonsCatalog';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('ButtonsCatalog', () => {
    it('renderiza a aba Curados por padrão', () => {
        render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getAllByText('Minimal Solid')[0]).toBeInTheDocument();
    });

    it('troca para a camada automática Por Estilo e cobre o gap do borderline', () => {
        render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        fireEvent.click(screen.getByRole('button', { name: /Por Estilo/i }));
        expect(screen.getAllByText('Minimalist Borderline')[0]).toBeInTheDocument();
    });
});
