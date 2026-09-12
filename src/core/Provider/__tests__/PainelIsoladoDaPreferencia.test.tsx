/**
 * "O painel edita o tema, não o design efetivo": os controles do painel
 * leem/gravam `sarak.systemDesign` (persistido puro). Este teste prova, pelo
 * Provider real, que uma preferência do usuário NUNCA aparece em
 * `systemDesign` — só em `design`/`activeDesign` (o efetivo).
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';
import { useSarakUI } from '../SarakUIProvider';

const Probe = () => {
    const sarak = useSarakUI();
    return (
        <div>
            <span data-testid="system-mode">{String(sarak.systemDesign?.mode)}</span>
            <span data-testid="effective-mode">{String(sarak.design?.mode)}</span>
            <button onClick={() => sarak.updatePreferences({ colorMode: 'dark' })}>trocar preferência</button>
        </div>
    );
};

describe('O painel enxerga só o tema — a preferência não vaza para `systemDesign`', () => {
    it('trocar a preferência de modo muda o EFETIVO e preserva o SISTEMA (tema)', () => {
        render(
            <SarakUIProvider initialTheme="terracota-solar">
                <Probe />
            </SarakUIProvider>,
        );

        expect(screen.getByTestId('system-mode')).toHaveTextContent('light');
        expect(screen.getByTestId('effective-mode')).toHaveTextContent('light');

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByTestId('effective-mode')).toHaveTextContent('dark');
        expect(screen.getByTestId('system-mode')).toHaveTextContent('light'); // o tema não mudou
    });
});
