import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { DecisionQuestionList } from '../DecisionQuestionList';
import { NavigationSchema } from '../../../../../core/Design/schema/navigation';
import type { DecisionQuestion } from '../../../utils/decisions';
import type { SarakDesignState } from '../../../../../core/Provider/types';

vi.mock('../BarSample', () => ({ BarSample: () => <div data-testid="bar-sample" /> }));

const token = (id: string) => NavigationSchema.tokens.find((candidate) => candidate.id === id)!;
const QUESTIONS: DecisionQuestion[] = [
    { id: 'how', textKey: 'barQuestionHow', tokens: [token('sidebarTone')] },
    { id: 'brand', textKey: 'barQuestionBrand', tokens: [token('sidebarLogoPlacement')] },
];

const renderList = (questions: DecisionQuestion[] = QUESTIONS) => render(
    <SarakUIProvider>
        <DecisionQuestionList
            questions={questions}
            mode="light"
            catalogMap={new Map()}
            draft={{} as SarakDesignState}
            updateDraft={vi.fn()}
            previewDevice="desktop"
        />
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
});
