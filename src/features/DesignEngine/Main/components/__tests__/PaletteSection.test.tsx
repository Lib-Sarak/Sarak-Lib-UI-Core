import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaletteSection } from '../PaletteSection';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { PEEK_DELAY_MS } from '../../../Canvas/components/peek';
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
vi.mock('../../../../../components/atomic/Modals/SarakOverlayProvider', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../../../../components/atomic/Modals/SarakOverlayProvider')>()),
    useOverlay: () => ({ open: vi.fn(), close: vi.fn(), confirm: confirmOverlay }),
}));

type Draft = Record<string, unknown>;
const captured: { draft: Draft } = { draft: {} };

/** Guarda o rascunho como o painel o guarda: só `updateDraft` o altera; nada é "aplicado". */
const Harness: React.FC<{ initial: Draft; applied?: Draft }> = ({ initial, applied }) => {
    const [draft, setDraft] = useState<Draft>(initial);
    captured.draft = draft;
    const updateDraft = (id: string, value: SarakTokenValue) => setDraft((prev) => ({ ...prev, [id]: value }));
    return <SarakUIProvider><PaletteSection draft={draft} appliedDesign={applied} updateDraft={updateDraft} /></SarakUIProvider>;
};

/** A galeria abre só o grupo da paleta escolhida: os testes que escolhem em outro grupo abrem todos antes. */
const openGalleryGroups = (): void => {
    document.querySelectorAll('[data-palette-group] [aria-expanded="false"]').forEach((toggle) => fireEvent.click(toggle));
};
const renderOpen = (ui: React.ReactElement) => {
    const view = render(ui);
    openGalleryGroups();
    return view;
};

const baseDraft = (): Draft => ({ mode: 'dark', primaryColor: '#19e3f0', sidebarColor: '#000000', colorPalette: '' });

describe('PaletteSection', () => {
    beforeEach(() => {
        confirmOverlay.mockReset();
        captured.draft = {};
    });

    it('escolher uma paleta pronta muda o rascunho com o valor e as cores calculadas do modo', async () => {
        renderOpen(<Harness initial={baseDraft()} applied={{ sidebarColor: '#000000', primaryColor: '#19e3f0' }} />);
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
        renderOpen(<Harness initial={{ ...baseDraft(), ...calculated, colorPalette: 'oceano', sidebarColor: '#123456' }} applied={{}} />);
        fireEvent.click(screen.getByRole('radio', { name: /Brasa/ }));
        await waitFor(() => expect(captured.draft.colorPalette).toBe('brasa'));
        expect(confirmOverlay).toHaveBeenCalledTimes(1);
        expect(captured.draft.sidebarColor).toBe('#123456');
        expect(captured.draft.topbarColor).toBe(sarakResolvePalette('brasa', 'dark').topbarColor);
    });

    it('"Descartar ajustes" substitui também o token ajustado pela nova paleta', async () => {
        confirmOverlay.mockResolvedValue(true);
        const calculated = sarakResolvePalette('oceano', 'dark');
        renderOpen(<Harness initial={{ ...baseDraft(), ...calculated, colorPalette: 'oceano', sidebarColor: '#123456' }} applied={{}} />);
        fireEvent.click(screen.getByRole('radio', { name: /Brasa/ }));
        await waitFor(() => expect(captured.draft.colorPalette).toBe('brasa'));
        expect(captured.draft.sidebarColor).toBe(sarakResolvePalette('brasa', 'dark').sidebarColor);
    });

    it('sem ajuste manual a troca não pergunta', async () => {
        const calculated = sarakResolvePalette('oceano', 'dark');
        renderOpen(<Harness initial={{ ...baseDraft(), ...calculated, colorPalette: 'oceano' }} applied={{}} />);
        fireEvent.click(screen.getByRole('radio', { name: /Brasa/ }));
        await waitFor(() => expect(captured.draft.colorPalette).toBe('brasa'));
        expect(confirmOverlay).not.toHaveBeenCalled();
    });

    it('a galeria é um radiogroup agrupado por tipo, com a paleta atual marcada', () => {
        renderOpen(<Harness initial={{ ...baseDraft(), colorPalette: 'floresta' }} applied={{}} />);
        const group = screen.getByRole('radiogroup', { name: 'Paletas prontas' });
        const radios = within(group).getAllByRole('radio');
        expect(radios).toHaveLength(3);
        expect(screen.getByRole('radio', { name: 'Floresta — Análoga' })).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByRole('radio', { name: 'Brasa — Triádica' })).toHaveAttribute('aria-checked', 'false');
        expect(radios.filter((radio) => radio.getAttribute('tabindex') === '0')).toHaveLength(1);
    });

    it('as setas só movem o foco, dando a volta no fim da lista: o rascunho não muda', async () => {
        renderOpen(<Harness initial={{ ...baseDraft(), colorPalette: 'oceano' }} applied={{}} />);
        const oceano = screen.getByRole('radio', { name: /Oceano/ });
        oceano.focus();
        await act(async () => { fireEvent.keyDown(oceano, { key: 'ArrowRight' }); });
        expect(screen.getByRole('radio', { name: /Floresta/ })).toHaveFocus();
        await act(async () => { fireEvent.keyDown(screen.getByRole('radio', { name: /Floresta/ }), { key: 'ArrowLeft' }); });
        await act(async () => { fireEvent.keyDown(screen.getByRole('radio', { name: /Oceano/ }), { key: 'ArrowLeft' }); });
        expect(screen.getByRole('radio', { name: /Brasa/ })).toHaveFocus();
        expect(captured.draft.colorPalette).toBe('oceano');
    });

    it('Enter na paleta com o foco a escolhe (o clique do botão), e escolher grava no rascunho', async () => {
        renderOpen(<Harness initial={{ ...baseDraft(), colorPalette: 'oceano' }} applied={{}} />);
        await act(async () => { fireEvent.click(screen.getByRole('radio', { name: /Floresta/ })); });
        await waitFor(() => expect(captured.draft.colorPalette).toBe('floresta'));
    });

    it('espiar uma paleta entrega o que ela escreveria, sem gravar no rascunho', async () => {
        vi.useFakeTimers();
        window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia;
        const onPeek = vi.fn();
        const updateDraft = vi.fn();
        renderOpen(<SarakUIProvider><PaletteSection draft={baseDraft()} appliedDesign={{}} updateDraft={updateDraft} onPeek={onPeek} /></SarakUIProvider>);
        fireEvent.mouseEnter(screen.getByRole('radio', { name: /Floresta/ }));
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
        vi.useRealTimers();
        expect(onPeek).toHaveBeenCalledWith(expect.objectContaining({ colorPalette: 'floresta', primaryColor: expect.any(String) }));
        expect(updateDraft).not.toHaveBeenCalled();
    });
});

describe('PaletteSection — manter minha paleta', () => {
    it('mostra o interruptor desligado, com o texto do padrão, e ligar grava keepPalette no rascunho', async () => {
        render(<Harness initial={baseDraft()} applied={{}} />);
        const toggle = screen.getByRole('switch', { name: /Manter minha paleta/ });
        expect(toggle).not.toBeChecked();
        expect(screen.getByText(/escolher um tema aplica as cores dele/)).toBeInTheDocument();
        fireEvent.click(toggle);
        await waitFor(() => expect(captured.draft.keepPalette).toBe(true));
    });

    it('ligado, o estado fica visível: a paleta vale por cima do tema, e desligar volta às cores do tema', async () => {
        render(<Harness initial={{ ...baseDraft(), keepPalette: true }} applied={{}} />);
        const toggle = screen.getByRole('switch', { name: /Manter minha paleta/ });
        expect(toggle).toBeChecked();
        expect(screen.getByText(/vale por cima do tema/)).toBeInTheDocument();
        fireEvent.click(toggle);
        await waitFor(() => expect(captured.draft.keepPalette).toBe(false));
    });
});

const BLUE = 'custom:analogous:#2563eb';
const REPLACED = 'custom:analogous:#aa3366';

/** Abre o criador, dá o nome e salva: o que o administrador faz para guardar uma paleta. */
const createAndSave = async (name: string, baseColor = '#2563eb') => {
    if (!screen.queryByRole('group', { name: 'Criar paleta' })) fireEvent.click(screen.getByRole('button', { name: 'Criar paleta a partir de uma cor' }));
    const form = screen.getByRole('group', { name: 'Criar paleta' });
    fireEvent.change(within(form).getByLabelText('Seletor de Cor-base'), { target: { value: baseColor } });
    fireEvent.change(within(form).getByLabelText('Nome da paleta'), { target: { value: name } });
    await act(async () => { fireEvent.click(within(form).getByRole('button', { name: 'Salvar paleta' })); });
};

describe('PaletteSection — a galeria recolhida', () => {
    it('abre só o grupo da paleta escolhida; os outros ficam recolhidos e sem linhas', () => {
        render(<Harness initial={{ ...baseDraft(), colorPalette: 'brasa' }} applied={{}} />);
        const toggles = Array.from(document.querySelectorAll('[data-palette-group] [data-group-toggle]'));
        expect(toggles.map((toggle) => [toggle.textContent, toggle.getAttribute('aria-expanded')])).toEqual([['Análoga', 'false'], ['Triádica', 'true']]);
        expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual(['Brasa — Triádica']);
    });

    it('sem paleta escolhida, tudo começa recolhido, e abrir um grupo mostra as linhas dele', () => {
        render(<Harness initial={baseDraft()} applied={{}} />);
        expect(screen.queryAllByRole('radio')).toHaveLength(0);
        fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Paletas prontas' })).getByRole('button', { name: 'Análoga' }));
        expect(screen.getAllByRole('radio')).toHaveLength(2);
    });
});

describe('PaletteSection — paletas salvas com nome', () => {
    beforeEach(() => { confirmOverlay.mockReset(); captured.draft = {}; });

    it('salvar com nome grava a lista no rascunho e o grupo "Minhas paletas" aparece com ela, aberto', async () => {
        render(<Harness initial={baseDraft()} applied={{}} />);
        await createAndSave('Marca azul');
        expect(captured.draft.savedPalettes).toBe(`sp-1|Marca azul|${BLUE}`);
        // O criador fecha para mostrar a galeria, e a mensagem de que a paleta foi guardada fica na seção.
        expect(screen.queryByRole('group', { name: 'Criar paleta' })).not.toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Paleta “Marca azul” salva');
        const mine = document.querySelector('[data-palette-group="mine"]') as HTMLElement;
        expect(within(mine).getByRole('button', { name: 'Minhas paletas' })).toHaveAttribute('aria-expanded', 'true');
        expect(within(mine).getByRole('radio', { name: 'Marca azul — Análoga' })).toBeInTheDocument();
        expect(captured.draft.colorPalette).toBe('');
    });

    it('salvar sem nome não grava e diz por quê', async () => {
        render(<Harness initial={baseDraft()} applied={{}} />);
        await createAndSave('   ');
        expect(captured.draft.savedPalettes).toBeUndefined();
        expect(screen.getByRole('status')).toHaveTextContent('Dê um nome à paleta para salvar.');
    });

    it('nome repetido pergunta antes de substituir: recusar mantém a atual, aceitar troca o valor', async () => {
        render(<Harness initial={{ ...baseDraft(), savedPalettes: `sp-1|Marca azul|${BLUE}` }} applied={{}} />);
        confirmOverlay.mockResolvedValueOnce(false);
        await createAndSave('marca  AZUL', '#aa3366');
        expect(confirmOverlay).toHaveBeenCalledTimes(1);
        expect(confirmOverlay.mock.calls[0][0]).toMatchObject({ title: 'Substituir a paleta?', message: expect.stringContaining('Marca azul') });
        expect(captured.draft.savedPalettes).toBe(`sp-1|Marca azul|${BLUE}`);

        confirmOverlay.mockResolvedValueOnce(true);
        await createAndSave('marca  AZUL', '#aa3366');
        await waitFor(() => expect(captured.draft.savedPalettes).toBe(`sp-1|Marca azul|${REPLACED}`));
    });

    it('escolher uma paleta salva grava o valor dela como colorPalette, como qualquer paleta', async () => {
        render(<Harness initial={{ ...baseDraft(), savedPalettes: `sp-1|Marca azul|${BLUE}` }} applied={{}} />);
        fireEvent.click(screen.getByRole('radio', { name: 'Marca azul — Análoga' }));
        await waitFor(() => expect(captured.draft.colorPalette).toBe(BLUE));
        expect(screen.getByRole('radio', { name: 'Marca azul — Análoga' })).toHaveAttribute('aria-checked', 'true');
    });

    it('apagar pede confirmação: cancelar mantém, confirmar tira da lista (e esvazia o texto gravado)', async () => {
        render(<Harness initial={{ ...baseDraft(), savedPalettes: `sp-1|Marca azul|${BLUE}` }} applied={{}} />);
        confirmOverlay.mockResolvedValueOnce(false);
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Apagar a paleta Marca azul' })); });
        expect(confirmOverlay.mock.calls[0][0]).toMatchObject({ title: 'Apagar a paleta?', tone: 'danger' });
        expect(captured.draft.savedPalettes).toBe(`sp-1|Marca azul|${BLUE}`);

        confirmOverlay.mockResolvedValueOnce(true);
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Apagar a paleta Marca azul' })); });
        await waitFor(() => expect(captured.draft.savedPalettes).toBe(''));
        expect(document.querySelector('[data-palette-group="mine"]')).toBeNull();
    });

    it('a salva é espiada como as outras: entrega o que ela escreveria, sem gravar', () => {
        vi.useFakeTimers();
        window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia;
        const onPeek = vi.fn();
        const updateDraft = vi.fn();
        render(<SarakUIProvider><PaletteSection draft={{ ...baseDraft(), savedPalettes: `sp-1|Marca azul|${BLUE}` }} appliedDesign={{}} updateDraft={updateDraft} onPeek={onPeek} /></SarakUIProvider>);
        fireEvent.mouseEnter(screen.getByRole('radio', { name: 'Marca azul — Análoga' }));
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
        vi.useRealTimers();
        expect(onPeek).toHaveBeenCalledWith(expect.objectContaining({ colorPalette: BLUE, primaryColor: expect.any(String) }));
        expect(updateDraft).not.toHaveBeenCalled();
    });
});
