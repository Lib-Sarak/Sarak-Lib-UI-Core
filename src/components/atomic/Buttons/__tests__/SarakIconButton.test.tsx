import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakIconButton';
import { SarakIconButton } from '../SarakIconButton';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakIconButton', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    it('renderiza sem SarakUIProvider, com o default de estilo aplicado (matte)', () => {
        expect(() =>
            render(<SarakIconButton icon={<span>x</span>} aria-label="ação" />),
        ).not.toThrow();
        const button = screen.getByRole('button', { name: 'ação' });
        expect(button.className).toContain('shadow-xl');
    });

    it('com SarakUIProvider, aplica o valor REAL do tema (neon) — não o default do átomo', () => {
        render(
            <SarakUIProvider config={{ btnStyleType: 'neon' }}>
                <SarakIconButton icon={<span>x</span>} aria-label="ação" />
            </SarakUIProvider>,
        );
        const button = screen.getByRole('button', { name: 'ação' });
        expect(button.className).not.toContain('shadow-xl');
        // 'matte' (default sem Provider) não toca `border`; só neon/frosted tocam — a
        // borda com a cor real de glow prova que o valor REAL do tema chegou.
        expect(button.style.border).toContain('rgba(0, 242, 255, 0.4)');
    });

    it('a className do chamador VENCE o rounded-btn default do átomo — merge, não concatenação', () => {
        render(<SarakIconButton icon={<span>x</span>} aria-label="ação" className="rounded-full" />);
        const button = screen.getByRole('button', { name: 'ação' });
        const classes = button.className.split(' ');

        expect(classes).toContain('rounded-full');
        expect(classes).not.toContain('rounded-btn');
    });
});

describe('SarakIconButton — leitores de btnGhostHoverBg, btnNeonPulseSpeed e btnStyleType cyberpunk', () => {
    const montar = (config: Record<string, unknown>, variant: 'primary' | 'ghost' = 'primary') => {
        render(
            <SarakUIProvider config={config}>
                <SarakIconButton variant={variant} icon={<span>x</span>} aria-label="ação" />
            </SarakUIProvider>,
        );
        return screen.getByRole('button', { name: 'ação' });
    };

    it('o hover do ghost lê --sarak-btn-ghost-hover', () => {
        expect(montar({}, 'ghost').className).toContain('hover:bg-[var(--sarak-btn-ghost-hover,rgba(255,255,255,0.05))]');
    });

    it('neon com velocidade > 0 liga o pulso; sem velocidade fica parado', () => {
        expect(montar({ btnStyleType: 'neon', btnNeonPulseSpeed: 1 }).className).toContain('sarak-btn-neon-pulse');
    });

    it('neon com velocidade 0 não leva a classe de pulso', () => {
        expect(montar({ btnStyleType: 'neon', btnNeonPulseSpeed: 0 }).className).not.toContain('sarak-btn-neon-pulse');
    });

    it('cyberpunk é wireframe: sem preenchimento e cantos retos', () => {
        const button = montar({ btnStyleType: 'cyberpunk' });
        expect(button.style.backgroundColor).toBe('transparent');
        expect(button.style.borderRadius).toBe('0px');
    });
});
