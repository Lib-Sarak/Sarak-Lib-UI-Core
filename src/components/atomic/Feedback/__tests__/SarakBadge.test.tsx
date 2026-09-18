import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakBadge';
import { SarakBadge } from '../SarakBadge';

describe('SarakBadge', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    // `--theme-border` é contrato de "borda sutil, baixa opacidade" (specs/09-temas-e-presets
    // §2 — `cardBorderColor`), não de fundo — em tema de borda opaca (`neo-brutalism`) um
    // badge com esse token como fundo fica ilegível. `--theme-surface`
    // (`cardBackgroundColor`) é o token com contrato de fundo, e o par texto×fundo
    // resultante (`textColorMuted`/`cardBackgroundColor`) já é medido pelo
    // `auditor_contraste` (`gates/scripts/audit/verify_contrast.ts`, PAIRS).
    it('a variante muted soft NÃO usa o token de borda como fundo', () => {
        render(<SarakBadge variant="muted" soft>Rótulo</SarakBadge>);

        const badge = screen.getByText('Rótulo');
        expect(badge.className).not.toMatch(/theme-border/);
        expect(badge.className).toMatch(/theme-surface/);
        expect(badge.className).toMatch(/theme-muted/);
    });
});
