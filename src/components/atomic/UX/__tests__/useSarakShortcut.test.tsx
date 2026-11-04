import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { sarakFormatShortcut, sarakShortcutFromEvent, useSarakShortcut, type SarakShortcutOptions } from '../useSarakShortcut';

const Probe = ({ keys, handler, options }: { keys: string | string[] | undefined; handler: () => void; options?: SarakShortcutOptions }): React.ReactElement => {
    useSarakShortcut(keys, handler, options);
    return <input aria-label="campo" />;
};

describe('useSarakShortcut', () => {
    it('dispara no atalho e chama preventDefault', () => {
        const handler = vi.fn();
        render(<Probe keys="ctrl+k" handler={handler} />);

        const notPrevented = fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(notPrevented).toBe(false);
    });

    it('mod vale Ctrl ou Cmd, e modificador a mais ou a menos não dispara', () => {
        const handler = vi.fn();
        render(<Probe keys="mod+k" handler={handler} />);

        fireEvent.keyDown(document, { key: 'k', metaKey: true });
        fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
        expect(handler).toHaveBeenCalledTimes(2);

        fireEvent.keyDown(document, { key: 'k' });
        fireEvent.keyDown(document, { key: 'k', ctrlKey: true, shiftKey: true });
        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('atalho sem modificador não dispara com o foco num campo, a menos que se permita', () => {
        const handler = vi.fn();
        const { getByLabelText, rerender } = render(<Probe keys="?" handler={handler} />);

        fireEvent.keyDown(getByLabelText('campo'), { key: '?' });
        expect(handler).not.toHaveBeenCalled();

        rerender(<Probe keys="?" handler={handler} options={{ allowInInputs: true }} />);
        fireEvent.keyDown(getByLabelText('campo'), { key: '?' });
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('aceita lista de atalhos, aliases (esc) e troca de atalho sem recarregar', () => {
        const handler = vi.fn();
        const { rerender } = render(<Probe keys={['esc', 'ctrl+j']} handler={handler} />);

        fireEvent.keyDown(document, { key: 'Escape' });
        fireEvent.keyDown(document, { key: 'j', ctrlKey: true });
        expect(handler).toHaveBeenCalledTimes(2);

        rerender(<Probe keys="alt+x" handler={handler} />);
        fireEvent.keyDown(document, { key: 'j', ctrlKey: true });
        fireEvent.keyDown(document, { key: 'x', altKey: true });
        expect(handler).toHaveBeenCalledTimes(3);
    });

    it('desligado ou sem atalho, não escuta; ao desmontar, solta o ouvinte', () => {
        const handler = vi.fn();
        const { rerender, unmount } = render(<Probe keys="ctrl+k" handler={handler} options={{ enabled: false }} />);
        fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

        rerender(<Probe keys={undefined} handler={handler} />);
        fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
        expect(handler).not.toHaveBeenCalled();

        rerender(<Probe keys="ctrl+k" handler={handler} />);
        unmount();
        fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
        expect(handler).not.toHaveBeenCalled();
    });

    it('usa o handler mais recente sem reinscrever', () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = render(<Probe keys="ctrl+k" handler={first} />);
        rerender(<Probe keys="ctrl+k" handler={second} />);

        fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });
});

describe('sarakShortcutFromEvent e sarakFormatShortcut', () => {
    it('grava o atalho do evento na ordem ctrl, alt, shift, meta e ignora só-modificador', () => {
        expect(sarakShortcutFromEvent({ key: 'K', ctrlKey: true, altKey: false, shiftKey: true, metaKey: false })).toBe('ctrl+shift+k');
        expect(sarakShortcutFromEvent({ key: 'Escape', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false })).toBe('escape');
        expect(sarakShortcutFromEvent({ key: 'Control', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false })).toBeNull();
    });

    it('o atalho gravado volta a funcionar no hook', () => {
        const handler = vi.fn();
        const recorded = sarakShortcutFromEvent({ key: 'p', ctrlKey: true, altKey: true, shiftKey: false, metaKey: false });
        render(<Probe keys={recorded ?? undefined} handler={handler} />);

        fireEvent.keyDown(document, { key: 'p', ctrlKey: true, altKey: true });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('formata para exibição', () => {
        expect(sarakFormatShortcut('ctrl+shift+k')).toBe('Ctrl+Shift+K');
    });
});
