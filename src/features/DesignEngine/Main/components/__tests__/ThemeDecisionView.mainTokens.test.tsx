import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { ThemeDecisionView } from '../ThemeDecisionView';
import type { DecisionOptionsContext } from '../ThemeDecisionOptions';
import { buildDecisionContext } from '../../../utils/decisionContext';
import { COLUMN_DECISIONS, decisionLayers } from '../../../utils/decisions';

import { prazoDeTeste } from '../../../../../shared/testing/prazoDeTeste';
vi.mock('../ThemeDecisionOptions', () => ({ ThemeDecisionOptions: () => <div data-testid="options" /> }));
vi.setConfig({ testTimeout: prazoDeTeste(30000) });

const decisionContext = buildDecisionContext();
const options = { sarak: {}, draft: {}, updateDraft: vi.fn(), catalogMap: new Map(), previewDevice: 'desktop' } as unknown as DecisionOptionsContext;
const MAIN_OPEN_LIMIT = 8;

/** Sem `ForceOpenSections`: a decisão como o usuário a abre, com as seções recolhidas por padrão. */
const renderPlain = (decisionId: string) => {
    const decision = COLUMN_DECISIONS.find((candidate) => candidate.id === decisionId)!;
    return render(<SarakUIProvider><ThemeDecisionView decision={decision} decisionContext={decisionContext} options={options} /></SarakUIProvider>);
};

const mainCount = (decisionId: string): number =>
    decisionLayers(COLUMN_DECISIONS.find((candidate) => candidate.id === decisionId)!, decisionContext).mainTokens.length;

describe('ThemeDecisionView — os ajustes principais longos abrem recolhidos', () => {
    it('Cores tem mais de oito ajustes principais: abre recolhido, sem controle desenhado, e abrir mostra todos', () => {
        expect(mainCount('colors')).toBeGreaterThan(MAIN_OPEN_LIMIT);
        renderPlain('colors');
        const toggle = screen.getByRole('button', { name: 'Ajustes principais' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(document.querySelectorAll('[data-token-row]')).toHaveLength(0);

        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(document.querySelectorAll('[data-token-row]')).toHaveLength(mainCount('colors'));
        expect(document.querySelector('[data-token-row="primaryColor"]')).not.toBeNull();
        expect(document.querySelector('[data-token-row="savedPalettes"]')).toBeNull();
    });

    it.each(COLUMN_DECISIONS.filter((decision) => mainCount(decision.id) > 0).map((decision) => [decision.id, mainCount(decision.id)] as const))(
        'a decisão %s (%i ajustes principais): recolhida só quando passa de oito, e aberta quando não passa',
        (decisionId, count) => {
            renderPlain(decisionId);
            const toggle = screen.queryByRole('button', { name: 'Ajustes principais' });
            if (count > MAIN_OPEN_LIMIT) {
                expect(toggle).toHaveAttribute('aria-expanded', 'false');
            } else {
                expect(toggle).toBeNull();
                expect(screen.getByRole('region', { name: 'Ajustes principais' }).querySelectorAll('[data-token-row]')).toHaveLength(count);
            }
        },
    );
});
