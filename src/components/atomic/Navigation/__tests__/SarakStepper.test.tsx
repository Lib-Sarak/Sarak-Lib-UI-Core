import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakStepper } from '../SarakStepper';

const steps = [{ label: 'Conta' }, { label: 'Perfil' }, { label: 'Revisão' }];

describe('Spec 14 — SarakStepper', () => {
    it('marca passos concluídos com ✓ e mostra o número dos pendentes', () => {
        render(<SarakStepper steps={steps} current={1} />);
        // 1 passo concluído (índice 0) → ✓
        expect(screen.getAllByText('✓')).toHaveLength(1);
        // passo atual (índice 1) e futuro (índice 2) mostram o número
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('marca o passo atual com aria-current="step"', () => {
        const { container } = render(<SarakStepper steps={steps} current={1} />);
        expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    });

    it('renderiza todos os rótulos', () => {
        render(<SarakStepper steps={steps} current={0} />);
        steps.forEach((s) => expect(screen.getByText(s.label)).toBeInTheDocument());
    });
});
