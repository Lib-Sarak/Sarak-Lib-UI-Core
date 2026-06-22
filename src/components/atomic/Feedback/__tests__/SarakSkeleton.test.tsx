import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakSkeleton } from '../SarakSkeleton';

describe('Spec 13 — SarakSkeleton (Regra 3: formas dinâmicas)', () => {
    it('deve renderizar N linhas no modo texto (default)', () => {
        const { container } = render(<SarakSkeleton rows={4} />);
        expect(screen.getByRole('status')).toHaveAttribute('data-shape', 'text');
        expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
    });

    it('deve assumir forma circular (avatar)', () => {
        render(<SarakSkeleton shape="circle" size="3rem" />);
        const el = screen.getByRole('status');
        expect(el).toHaveAttribute('data-shape', 'circle');
        expect(el.style.borderRadius).toBe('50%');
    });

    it('deve assumir forma retangular (bloco)', () => {
        render(<SarakSkeleton shape="rect" rowHeight="120px" />);
        expect(screen.getByRole('status')).toHaveAttribute('data-shape', 'rect');
    });
});
