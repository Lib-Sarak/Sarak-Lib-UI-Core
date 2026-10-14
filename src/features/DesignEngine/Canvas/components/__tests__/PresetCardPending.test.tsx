import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { PresetCardPending } from '../PresetCardPending';
import type { SarakThemeCatalogEntry } from '../../../../../core/Design/presets/themes';

const entry: SarakThemeCatalogEntry = {
    id: 'meu-tema',
    name: 'Meu Tema',
    description: 'Uma descrição curta.',
    mode: 'dark',
    hasContraparte: true,
    swatch: { primaryColor: '#111111', colorBgBody: '#222222', textColorMaster: '#333333' },
    swatchOpposite: { primaryColor: '#aaaaaa', colorBgBody: '#bbbbbb', textColorMaster: '#cccccc' },
};

describe('PresetCardPending — o cartão do tema que ainda não chegou', () => {
    it('mostra nome e descrição vindos só do catálogo leve', () => {
        render(<PresetCardPending entry={entry} currentMode="dark" onChoose={vi.fn()} />);
        expect(screen.getByText('Meu Tema')).toBeInTheDocument();
        expect(screen.getByText('Uma descrição curta.')).toBeInTheDocument();
    });

    it('desenha a amostra do modo PEDIDO: a nativa quando o modo bate, a oposta quando não', () => {
        const { container, rerender } = render(<PresetCardPending entry={entry} currentMode="dark" onChoose={vi.fn()} />);
        const backdrop = () => container.querySelector('div') as HTMLElement;
        expect(backdrop().style.backgroundColor).toBe('rgb(34, 34, 34)');

        rerender(<PresetCardPending entry={entry} currentMode="light" onChoose={vi.fn()} />);
        expect(backdrop().style.backgroundColor).toBe('rgb(187, 187, 187)');
    });

    it('escolher chama onChoose e se anuncia ocupado', () => {
        const onChoose = vi.fn();
        render(<PresetCardPending entry={entry} currentMode="dark" onChoose={onChoose} />);
        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('aria-busy', 'true');
        fireEvent.click(button);
        expect(onChoose).toHaveBeenCalledTimes(1);
    });
});
