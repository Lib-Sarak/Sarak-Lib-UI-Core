import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakButton';
import { SarakButton } from '../SarakButton';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakButton', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    it('renderiza sem SarakUIProvider, com o default de estilo aplicado (matte)', () => {
        expect(() => render(<SarakButton>Salvar</SarakButton>)).not.toThrow();
        const button = screen.getByRole('button', { name: 'Salvar' });
        expect(button.className).toContain('shadow-xl');
    });

    it('com SarakUIProvider, aplica o valor REAL do tema (neon) — não o default do átomo', () => {
        render(
            <SarakUIProvider config={{ btnStyleType: 'neon' }}>
                <SarakButton>Salvar</SarakButton>
            </SarakUIProvider>,
        );
        const button = screen.getByRole('button', { name: 'Salvar' });
        // 'matte' é o único styleType que adiciona shadow-xl (SarakButton.tsx:53); neon
        // real chegando prova que a leniência do átomo não vazou para o caminho com Provider.
        expect(button.className).not.toContain('shadow-xl');
        expect(button.style.border).toContain('1px solid');
    });

    it('a className do chamador VENCE os defaults do átomo — merge, não concatenação', () => {
        render(
            <SarakButton className="normal-case tracking-normal text-lg">Salvar</SarakButton>,
        );
        const button = screen.getByRole('button', { name: 'Salvar' });
        const classes = button.className.split(' ');

        expect(classes).toContain('normal-case');
        expect(classes).not.toContain('uppercase');

        expect(classes).toContain('tracking-normal');
        expect(classes).not.toContain('tracking-widest');

        expect(classes).toContain('text-lg');
        expect(classes).not.toContain('text-sm'); // default do size="md" (SarakButton.tsx sizeClasses)
    });

    it('fullWidth produz w-full DE FATO — sem min-w-fit sobrando para travar o encolhimento', () => {
        render(
            <SarakButton fullWidth>Um rótulo bem comprido, maior que qualquer container estreito de teste</SarakButton>,
        );
        const button = screen.getByRole('button', { name: /Um rótulo bem comprido/ });
        const classes = button.className.split(' ');

        expect(classes).toContain('w-full');
        expect(classes).not.toContain('w-max');
        expect(classes).not.toContain('min-w-fit');
    });

    it('w-full pedido só por className (sem fullWidth) também produz w-full DE FATO — sem min-w-fit sobrando', () => {
        render(
            <SarakButton className="w-full">Um rótulo bem comprido, maior que qualquer container estreito de teste</SarakButton>,
        );
        const button = screen.getByRole('button', { name: /Um rótulo bem comprido/ });
        const classes = button.className.split(' ');

        expect(classes).toContain('w-full');
        expect(classes).not.toContain('w-max');
        expect(classes).not.toContain('min-w-fit');
    });
});

describe('SarakButton — leitores de btnGhostHoverBg, btnNeonPulseSpeed e btnStyleType cyberpunk', () => {
    const montar = (config: Record<string, unknown>, variant: 'primary' | 'ghost' = 'primary') => {
        render(
            <SarakUIProvider config={config}>
                <SarakButton variant={variant}>Salvar</SarakButton>
            </SarakUIProvider>,
        );
        return screen.getByRole('button', { name: 'Salvar' });
    };

    it('o hover do ghost lê --sarak-btn-ghost-hover, com o branco translúcido de sempre como reserva', () => {
        const button = montar({}, 'ghost');
        expect(button.className).toContain('hover:bg-[var(--sarak-btn-ghost-hover,rgba(255,255,255,0.05))]');
        expect(button.className).not.toContain('hover:bg-white/5');
    });

    it('neon com velocidade > 0 liga o pulso; com 0 (padrão) o brilho fica parado', () => {
        expect(montar({ btnStyleType: 'neon', btnNeonPulseSpeed: 2 }).className).toContain('sarak-btn-neon-pulse');
    });

    it('neon com velocidade 0 não leva a classe de pulso', () => {
        expect(montar({ btnStyleType: 'neon', btnNeonPulseSpeed: 0 }).className).not.toContain('sarak-btn-neon-pulse');
    });

    it('o pulso só vale no estilo neon', () => {
        expect(montar({ btnStyleType: 'matte', btnNeonPulseSpeed: 2 }).className).not.toContain('sarak-btn-neon-pulse');
    });

    it('cyberpunk é wireframe: sem preenchimento, contorno na cor do brilho e cantos retos', () => {
        const button = montar({ btnStyleType: 'cyberpunk', btnNeonGlowColor: 'rgb(1, 2, 3)' });
        expect(button.style.backgroundColor).toBe('transparent');
        expect(button.style.border).toContain('rgb(1, 2, 3)');
        expect(button.style.borderRadius).toBe('0px');
    });
});

describe('SarakButton — o aperto dura motionDurationInstant', () => {
    it('a classe `transition-all` (150 ms) cede, só durante :active, à duração instantânea do tema', () => {
        const { container } = render(<SarakButton>Salvar</SarakButton>);
        expect(container.querySelector('button')?.className)
            .toContain('active:[transition-duration:var(--sarak-motion-dur-instant,0.1s)]');
    });
});
