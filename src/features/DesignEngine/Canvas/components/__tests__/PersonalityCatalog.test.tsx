import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { PERSONALITIES } from '../../../../../core/Design/presets/components/personalities';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { sarakGetDefaultDesignState } from '../../../../../core/Design/master-map';
import { PersonalityCatalog } from '../PersonalityCatalog';

const DRAFT = { ...sarakGetDefaultDesignState(), colorPalette: 'oceano', mode: 'dark' } as never;
const withProvider = (node: React.ReactElement) => <SarakUIProvider>{node}</SarakUIProvider>;

describe('PersonalityCatalog', () => {
    beforeAll(() => {
        vi.stubGlobal('ResizeObserver', class { observe(): void {} unobserve(): void {} disconnect(): void {} });
        vi.stubGlobal('IntersectionObserver', class { observe(): void {} unobserve(): void {} disconnect(): void {} });
    });

    it('desenha uma opção por Personalidade, com o nome em português, e a dica de que a cor fica a da paleta', () => {
        render(withProvider(<PersonalityCatalog draft={DRAFT} currentMode="dark" onSelect={vi.fn()} />));
        expect(document.querySelectorAll('[data-option-tile]')).toHaveLength(PERSONALITIES.length);
        PERSONALITIES.forEach((personality) => expect(screen.getByRole('button', { name: personality.name })).toBeInTheDocument());
        expect(screen.getByText(/A cor fica a da paleta escolhida/)).toBeInTheDocument();
    });

    it('cada Personalidade é um quadrado pequeno com o nome, na orientação dela e sem texto dentro da amostra', () => {
        render(withProvider(<PersonalityCatalog draft={DRAFT} currentMode="dark" onSelect={vi.fn()} />));
        expect(document.querySelectorAll('[data-option-tile][data-option-sample], [data-option-tile] [data-option-sample]')).toHaveLength(PERSONALITIES.length);
        document.querySelectorAll('[data-option-sample]').forEach((sample) => expect(sample.textContent).toBe(''));
        expect(document.querySelector('[data-preset-group="personalities"] .grid')?.className).toContain('minmax(5.5rem,1fr)');
    });

    it('o clique entrega a Personalidade a quem decide (a pergunta de ajuste é dele); a galeria não grava', () => {
        const onSelect = vi.fn();
        render(withProvider(<PersonalityCatalog draft={DRAFT} currentMode="dark" onSelect={onSelect} />));
        fireEvent.click(screen.getByRole('button', { name: 'Vidro' }));
        expect(onSelect).toHaveBeenCalledWith(PERSONALITIES.find((personality) => personality.id === 'personality-glass'));
    });
});
