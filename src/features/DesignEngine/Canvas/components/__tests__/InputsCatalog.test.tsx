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
});
