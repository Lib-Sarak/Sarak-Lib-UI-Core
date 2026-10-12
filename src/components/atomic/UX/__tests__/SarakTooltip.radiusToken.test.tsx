import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakTooltip } from '../SarakTooltip';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';

const FALLBACK_RADIUS_PX = 6;

describe('tooltipRadius — o raio da caixa do tooltip lê --sarak-tooltip-radius', () => {
    it('a caixa aberta usa a variável do token como raio', async () => {
        render(<SarakTooltip content="Dica" delay={0}><button type="button">alvo</button></SarakTooltip>);
        fireEvent.focus(screen.getByRole('button', { name: 'alvo' }));
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip.className).toContain('rounded-[var(--sarak-tooltip-radius,6px)]');
    });

    it('fundo, texto e borda leem tooltipBg, tooltipTextColor e tooltipBorderColor, com o tema como reserva', async () => {
        render(<SarakTooltip content="Dica" delay={0}><button type="button">alvo</button></SarakTooltip>);
        fireEvent.focus(screen.getByRole('button', { name: 'alvo' }));
        const classes = (await screen.findByRole('tooltip')).className;
        expect(classes).toContain('bg-[var(--sarak-tooltip-bg,var(--theme-surface))]');
        expect(classes).toContain('text-[var(--sarak-tooltip-text,var(--color-theme-title,#ffffff))]');
        expect(classes).toContain('border-[var(--sarak-tooltip-border,var(--theme-border))]');
    });

    it('os padrões das três cores reproduzem o que a caixa desenhava (superfície, título, borda do tema)', () => {
        const defaults = Object.fromEntries(
            sarakGetAllDesignTokens().filter((item) => /^tooltip(Bg|TextColor|BorderColor)$/.test(item.id)).map((item) => [item.id, item.defaultValue]),
        );
        expect(defaults).toEqual({
            tooltipBg: 'var(--theme-surface)',
            tooltipTextColor: 'var(--color-theme-title, #ffffff)',
            tooltipBorderColor: 'var(--theme-border)',
        });
    });

    it('o valor padrão do schema é o raio que a caixa desenhava (rounded-md = 6px)', () => {
        const token = sarakGetAllDesignTokens().find((item) => item.id === 'tooltipRadius');
        expect(token?.defaultValue).toBe(FALLBACK_RADIUS_PX);
    });
});
