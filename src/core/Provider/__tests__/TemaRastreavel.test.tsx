/**
 * plan-27 — a contraparte só serve se o sistema souber qual tema está no ar.
 *
 * A `plan-26` construiu `resolveThemeForMode` e as contrapartes autoradas, mas
 * `ShellThemeToggle` só as encontra procurando `activeThemeId` — e o consumidor
 * que segue a recomendação da `09-temas-e-presets` §4.3 ("use `initialTheme`,
 * é o caminho seguro") nunca preenche essa prop. `activeThemeId` fica
 * `undefined`, nenhum tema é rastreável, e o toggle cai sempre no fallback
 * sintetizado (`syncThemeWithMode`) — a contraparte autorada nunca é usada.
 *
 * Este teste exercita o Provider REAL (não mocks) pela porta `initialTheme`,
 * exatamente como a spec recomenda e como o consumidor real faz.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';
import { useSarakUI } from '../SarakUIProvider';
import { ShellThemeToggle } from '../../Shell/Components/ShellThemeToggle';

// O invariante das duas portas (§3.3) mora em
// `src/features/DesignEngine/__tests__/DuasPortasModoTema.test.tsx` — ele
// precisa de `useDesignDraft` (features/), e `core/` não pode importar
// `features/` (R1), nem em teste (auditor_arquitetura não isenta `__tests__/`).

const Probe = () => {
    const { design } = useSarakUI();
    return (
        <div>
            <span data-testid="mode">{String(design?.mode)}</span>
            <span data-testid="bg">{String(design?.colorBgBody)}</span>
        </div>
    );
};

describe('Tema rastreável — a contraparte é encontrada pela porta `initialTheme` (plan-27)', () => {
    it('trocar de modo pelo ShellThemeToggle aplica a CONTRAPARTE AUTORADA de terracota-solar, não a síntese', () => {
        render(
            <SarakUIProvider initialTheme="terracota-solar">
                <ShellThemeToggle variant="mini" />
                <Probe />
            </SarakUIProvider>,
        );

        // `terracota-solar` é nativamente `light`, com `colorBgBody: '#f9f5f1'`.
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
        expect(screen.getByTestId('bg')).toHaveTextContent('#f9f5f1');

        fireEvent.click(screen.getByRole('button'));

        // A contraparte AUTORADA (plan-26) declara `colorBgBody: '#0e0a06'` para
        // o modo escuro — um valor ESCOLHIDO, que `syncThemeWithMode` nunca
        // produziria a partir de `#f9f5f1` (suas faixas fixas de `bg` mandam
        // L≤15, mas preservando H/S de `#f9f5f1`, não este valor específico).
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
        expect(screen.getByTestId('bg')).toHaveTextContent('#0e0a06');
    });
});
