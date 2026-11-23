import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { DecisionQuestionList } from '../DecisionQuestionList';
import { ForceOpenSections } from '../CollapsibleSection';
import { NavigationSchema } from '../../../../../core/Design/schema/navigation';
import type { DecisionQuestion } from '../../../utils/decisions';
import type { SarakDesignState } from '../../../../../core/Provider/types';

vi.mock('../BarSample', () => ({ BarSample: () => <div data-testid="bar-sample" /> }));

const token = (id: string) => NavigationSchema.tokens.find((candidate) => candidate.id === id)!;
const QUESTIONS: DecisionQuestion[] = [
    { id: 'how', textKey: 'barQuestionHow', tokens: [token('sidebarTone')] },
    { id: 'brand', textKey: 'barQuestionBrand', tokens: [token('sidebarLogoPlacement')] },
];

const renderList = (questions: DecisionQuestion[] = QUESTIONS, open = true) => render(
    <SarakUIProvider>
        <ForceOpenSections.Provider value={open}>
        <DecisionQuestionList
            questions={questions}
            mode="light"
            catalogMap={new Map()}
            draft={{} as SarakDesignState}
            updateDraft={vi.fn()}
            previewDevice="desktop"
        />
        </ForceOpenSections.Provider>
    </SarakUIProvider>,
);

describe('DecisionQuestionList', () => {
    it('cada pergunta é uma região nomeada com a amostra e o controle de cada token', () => {
        renderList();
        const how = screen.getByRole('region', { name: 'Como é a barra' });
        expect(how.querySelector('[data-testid="bar-sample"]')).not.toBeNull();
        expect(how.querySelector('[data-token-row="sidebarTone"]')).not.toBeNull();
        const brand = screen.getByRole('region', { name: 'Marca' });
        expect(brand.querySelector('[data-token-row="sidebarLogoPlacement"]')).not.toBeNull();
    });

    it('as perguntas saem na ordem recebida', () => {
        renderList();
        expect(Array.from(document.querySelectorAll('[data-decision-question]')).map((node) => node.getAttribute('data-decision-question'))).toEqual(['how', 'brand']);
    });

    it('sem perguntas não desenha nada', () => {
        const { container } = renderList([]);
        expect(container.querySelector('[data-decision-question]')).toBeNull();
    });

    it('as perguntas abrem recolhidas, sem desenhar a amostra, e o título abre cada uma', () => {
        const { container, getAllByRole } = renderList(QUESTIONS, false);
        expect(container.querySelector('[data-testid="bar-sample"]')).toBeNull();
        const toggles = getAllByRole('button');
        expect(toggles.every((toggle) => toggle.getAttribute('aria-expanded') === 'false')).toBe(true);
        fireEvent.click(toggles[0]);
        expect(container.querySelectorAll('[data-testid="bar-sample"]')).toHaveLength(1);
    });
});
