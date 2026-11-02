import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SAMPLE_BUTTON_STATES, SampleButton, SampleButtonStates, SampleCard, SampleInputStates } from '../SampleParts';

describe('SampleParts', () => {
    it('SampleCard desenha o cartão real com título, valor e botão', () => {
        const { container } = render(<SampleCard />);
        const card = container.querySelector('.sarak-card') as HTMLElement;

        expect(card.querySelector('[data-testid="sample-card-title"]')).toHaveTextContent('Receita do mês');
        expect(card.querySelector('[data-testid="sample-card-value"]')).toBeInTheDocument();
        expect(card.querySelector('button')).toBeInTheDocument();
    });

    it('SampleButtonStates mostra repouso, hover, foco e inativo na ordem, cada um com o nome', () => {
        const { container } = render(<SampleButtonStates />);
        const figures = Array.from(container.querySelectorAll('figure'));

        expect(figures.map((figure) => figure.getAttribute('data-sample-state'))).toEqual([...SAMPLE_BUTTON_STATES]);
        expect(figures.map((figure) => figure.querySelector('figcaption')!.textContent)).toEqual(['Repouso', 'Mouse em cima', 'Foco', 'Inativo']);
    });

    it('o estado inativo desabilita o botão real e só o de foco leva o anel de foco', () => {
        const { container } = render(<SampleButtonStates />);
        const buttonOf = (state: string) => container.querySelector(`[data-sample-state="${state}"] button`) as HTMLButtonElement;

        expect(buttonOf('disabled')).toBeDisabled();
        expect(buttonOf('rest')).not.toBeDisabled();
        expect(buttonOf('focus').getAttribute('style')).toContain('outline');
        expect(buttonOf('rest').getAttribute('style') ?? '').not.toContain('outline');
    });

    it('o estado hover chega ao botão pelo evento que o React escuta, não por cor escrita', () => {
        const hovered: EventTarget[] = [];
        const listen = (event: Event) => hovered.push(event.target as EventTarget);
        document.addEventListener('mouseover', listen, true);
        const rest = render(<SampleButton state="rest" />);
        expect(hovered).toHaveLength(0);

        const hover = render(<SampleButton state="hover" />);
        document.removeEventListener('mouseover', listen, true);
        expect(hovered).toEqual([hover.container.querySelector('button')]);
        expect(rest.container.querySelector('button')).not.toBeNull();
    });

    it('SampleInputStates mostra o campo real em repouso e com foco', () => {
        const { container } = render(<SampleInputStates />);
        const restInput = container.querySelector('[data-sample-state="rest"] input') as HTMLInputElement;
        const focusInput = container.querySelector('[data-sample-state="focus"] input') as HTMLInputElement;

        expect(restInput).toHaveValue('Maria Souza');
        expect(focusInput.getAttribute('style')).not.toBe(restInput.getAttribute('style'));
    });
});
