/**
 * plan-27 PASSO 6 — o invariante das duas portas (§3.3).
 *
 * O toggle do cromo (`ShellThemeToggle`) e o seletor "Tema do Sistema" do
 * painel (o token `mode`, via `useDesignDraft.updateDraft`) são DUAS PORTAS
 * para a MESMA ação — depois desta plan, têm de produzir design idêntico
 * para o mesmo tema e o mesmo modo alvo. Este teste importa `useDesignDraft`
 * (features/) e `SarakUIProvider`/`ShellThemeToggle` (core/) — por isso mora
 * aqui, não em `core/Provider/__tests__/`: `core/` não pode importar
 * `features/` (R1), e o auditor de arquitetura não isenta `__tests__/`.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { ShellThemeToggle } from '../../../../core/Shell/Components/ShellThemeToggle';
import { GLOBAL_THEMES } from '../../../../core/Design/presets/themes';
import { useDesignDraft } from '../useDesignDraft';

describe('O invariante das duas portas (§3.3) — toggle do cromo × seletor "Tema do Sistema" do painel', () => {
    it('produzem design IDÊNTICO, chave a chave, para o mesmo tema e o mesmo modo alvo', () => {
        const tema = GLOBAL_THEMES.find((t) => t.id === 'ardosia-ao-entardecer')!;
        const chavesDaContraparte = Object.keys(tema.contraparte ?? {});
        expect(chavesDaContraparte.length).toBeGreaterThan(0); // salvaguarda: o teste não vale nada sobre um tema sem contraparte

        // Porta 1 — o toggle do cromo, aplicando direto ao SISTEMA.
        let portaToggle: Record<string, unknown> | null = null;
        const ProbeSistema = () => {
            const { design } = useSarakUI();
            portaToggle = design as unknown as Record<string, unknown>;
            return null;
        };
        render(
            <SarakUIProvider initialTheme="ardosia-ao-entardecer">
                <ShellThemeToggle variant="mini" />
                <ProbeSistema />
            </SarakUIProvider>,
        );
        fireEvent.click(screen.getByRole('button'));

        // Porta 2 — o token `mode` do painel, via `useDesignDraft.updateDraft`.
        let portaPainel: Record<string, unknown> | null = null;
        const HarnessPainel = () => {
            const sarak = useSarakUI();
            const { draft, updateDraft } = useDesignDraft(sarak);
            portaPainel = draft as unknown as Record<string, unknown>;
            return (
                <button data-testid="painel-mode" onClick={() => updateDraft('mode', 'light')}>
                    painel
                </button>
            );
        };
        render(
            <SarakUIProvider initialTheme="ardosia-ao-entardecer">
                <HarnessPainel />
            </SarakUIProvider>,
        );
        fireEvent.click(screen.getByTestId('painel-mode'));

        expect(portaToggle).not.toBeNull();
        expect(portaPainel).not.toBeNull();

        // As duas portas concordam no `mode` e em TODA chave que a contraparte declara.
        const sistema = portaToggle as unknown as Record<string, unknown>;
        const painel = portaPainel as unknown as Record<string, unknown>;
        expect(sistema.mode).toBe('light');
        expect(painel.mode).toBe('light');
        for (const chave of chavesDaContraparte) {
            expect(painel[chave], `chave "${chave}" diverge entre as duas portas`).toBe(sistema[chave]);
        }
    });
});
