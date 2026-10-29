import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaletteSection } from '../PaletteSection';
import { parsePaletteValue } from '../../../../../core/Design/palette/parser';
import { sarakResolvePalette } from '../../../../../core/Design/palette/resolve';
import type { SarakTokenValue } from '../../../../../core/Design/types';

vi.mock('../../../../../core/Design/palette/presets', () => ({
    SARAK_PALETTE_PRESETS: {
        oceano: { type: 'analogous', base: '#2563eb' },
        floresta: { type: 'analogous', base: '#16a34a' },
        brasa: { type: 'triadic', base: '#dc2626' },
    },
    SARAK_PALETTE_PRESET_TEXT_KEYS: {},
}));

const confirmOverlay = vi.fn();
vi.mock('../../../../../components/atomic/Modals/SarakOverlayProvider', () => ({
    useOverlay: () => ({ open: vi.fn(), close: vi.fn(), confirm: confirmOverlay }),
}));

type Draft = Record<string, unknown>;
const captured: { draft: Draft } = { draft: {} };

/** Guarda o rascunho como o painel o guarda: só `updateDraft` o altera; nada é "aplicado". */
const Harness: React.FC<{ initial: Draft; applied?: Draft }> = ({ initial, applied }) => {
    const [draft, setDraft] = useState<Draft>(initial);
    captured.draft = draft;
    const updateDraft = (id: string, value: SarakTokenValue) => setDraft((prev) => ({ ...prev, [id]: value }));
    return <PaletteSection draft={draft} appliedDesign={applied} updateDraft={updateDraft} />;
};

const baseDraft = (): Draft => ({ mode: 'dark', primaryColor: '#19e3f0', sidebarColor: '#000000', colorPalette: '' });

describe('PaletteSection', () => {
    beforeEach(() => {
        confirmOverlay.mockReset();
        captured.draft = {};
    });

    it('escolher uma paleta pronta muda o rascunho com o valor e as cores calculadas do modo', async () => {
        render(<Harness initial={baseDraft()} applied={{ sidebarColor: '#000000', primaryColor: '#19e3f0' }} />);
        fireEvent.click(screen.getByRole('radio', { name: /Floresta/ }));
        await waitFor(() => expect(captured.draft.colorPalette).toBe('floresta'));
        expect(captured.draft.sidebarColor).toBe(sarakResolvePalette('floresta', 'dark').sidebarColor);
        expect(confirmOverlay).not.toHaveBeenCalled();
    });

    it('criar a partir de uma cor grava a entrada custom: com vírgula e só no rascunho', async () => {
        render(<Harness initial={baseDraft()} applied={{}} />);
        fireEvent.click(screen.getByRole('button', { name: 'Criar paleta a partir de uma cor' }));
        const form = screen.getByRole('group', { name: 'Criar paleta' });
        fireEvent.change(within(form).getByLabelText('Seletor de Cor-base'), { target: { value: '#aa3366' } });
        fireEvent.change(within(form).getByLabelText('Tipo de paleta'), { target: { value: 'triadic' } });
        fireEvent.click(within(form).getByLabelText('Definir a cor secundária'));
        fireEvent.click(within(form).getByRole('button', { name: 'Usar esta paleta' }));
        await waitFor(() => expect(String(captured.draft.colorPalette)).toMatch(/^custom:triadic:#aa3366,sec=#aa3366$/));
        expect(String(captured.draft.colorPalette)).not.toContain(';');
        expect(parsePaletteValue(captured.draft.colorPalette)).toMatchObject({ type: 'triadic', base: '#aa3366' });
        expect(screen.queryByRole('group', { name: 'Criar paleta' })).not.toBeInTheDocument();
    });

    it('a prévia do criador tem nome acessível e mostra os dois modos', () => {
        render(<Harness initial={baseDraft()} applied={{}} />);
        fireEvent.click(screen.getByRole('button', { name: 'Criar paleta a partir de uma cor' }));
        const preview = screen.getByRole('img', { name: 'Prévia da paleta: Paleta criada' });
        expect(within(preview).getByTestId('palette-swatch-light')).toBeInTheDocument();
        expect(within(preview).getByTestId('palette-swatch-dark')).toBeInTheDocument();
    });

    it('um ajuste de token sobrevive quando o usuário mantém (ou fecha o diálogo) ao trocar de paleta', async () => {
        confirmOverlay.mockResolvedValue(false);
        const calculated = sarakResolvePalette('oceano', 'dark');
        render(<Harness initial={{ ...baseDraft(), ...calculated, colorPalette: 'oceano', sidebarColor: '#123456' }} applied={{}} />);
        fireEvent.click(screen.getByRole('radio', { name: /Brasa/ }));
        await waitFor(() => expect(captured.draft.colorPalette).toBe('brasa'));
        expect(confirmOverlay).toHaveBeenCalledTimes(1);
        expect(captured.draft.sidebarColor).toBe('#123456');
        expect(captured.draft.topbarColor).toBe(sarakResolvePalette('brasa', 'dark').topbarColor);
    });

    it('"Descartar ajustes" substitui também o token ajustado pela nova paleta', async () => {
        confirmOverlay.mockResolvedValue(true);
        const calculated = sarakResolvePalette('oceano', 'dark');
        render(<Harness initial={{ ...baseDraft(), ...calculated, colorPalette: 'oceano', sidebarColor: '#123456' }} applied={{}} />);
        fireEvent.click(screen.getByRole('radio', { name: /Brasa/ }));
        await waitFor(() => expect(captured.draft.colorPalette).toBe('brasa'));
        expect(captured.draft.sidebarColor).toBe(sarakResolvePalette('brasa', 'dark').sidebarColor);
    });

    it('sem ajuste manual a troca não pergunta', async () => {
        const calculated = sarakResolvePalette('oceano', 'dark');
        render(<Harness initial={{ ...baseDraft(), ...calculated, colorPalette: 'oceano' }} applied={{}} />);
        fireEvent.click(screen.getByRole('radio', { name: /Brasa/ }));
        await waitFor(() => expect(captured.draft.colorPalette).toBe('brasa'));
        expect(confirmOverlay).not.toHaveBeenCalled();
    });

    it('a galeria é um radiogroup agrupado por tipo, com a paleta atual marcada', () => {
        render(<Harness initial={{ ...baseDraft(), colorPalette: 'floresta' }} applied={{}} />);
        const group = screen.getByRole('radiogroup', { name: 'Paletas prontas' });
        const radios = within(group).getAllByRole('radio');
        expect(radios).toHaveLength(3);
        expect(screen.getByRole('radio', { name: 'Floresta — Análoga' })).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByRole('radio', { name: 'Brasa — Triádica' })).toHaveAttribute('aria-checked', 'false');
        expect(radios.filter((radio) => radio.getAttribute('tabindex') === '0')).toHaveLength(1);
    });

    it('as setas movem o foco e a seleção, dando a volta no fim da lista', async () => {
        render(<Harness initial={{ ...baseDraft(), colorPalette: 'oceano' }} applied={{}} />);
        const oceano = screen.getByRole('radio', { name: /Oceano/ });
        oceano.focus();
        await act(async () => { fireEvent.keyDown(oceano, { key: 'ArrowRight' }); });
        await waitFor(() => expect(captured.draft.colorPalette).toBe('floresta'));
        expect(screen.getByRole('radio', { name: /Floresta/ })).toHaveFocus();
        await act(async () => { fireEvent.keyDown(screen.getByRole('radio', { name: /Floresta/ }), { key: 'ArrowLeft' }); });
        await waitFor(() => expect(captured.draft.colorPalette).toBe('oceano'));
        await act(async () => { fireEvent.keyDown(screen.getByRole('radio', { name: /Oceano/ }), { key: 'ArrowLeft' }); });
        await waitFor(() => expect(captured.draft.colorPalette).toBe('brasa'));
    });
});
