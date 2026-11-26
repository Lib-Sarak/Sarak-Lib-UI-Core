import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInertBackground } from '../useInertBackground';

const mountFrame = (): { scrim: HTMLElement; drawer: HTMLElement; header: HTMLElement; content: HTMLElement } => {
    document.body.innerHTML = '<div id="frame"><header></header><button id="scrim"></button><aside id="drawer"></aside><main></main></div>';
    return {
        header: document.querySelector('header') as HTMLElement,
        scrim: document.getElementById('scrim') as HTMLElement,
        drawer: document.getElementById('drawer') as HTMLElement,
        content: document.querySelector('main') as HTMLElement,
    };
};

describe('useInertBackground', () => {
    it('com a gaveta aberta, deixa inertes os irmãos dela, menos a gaveta e o scrim, e desfaz ao fechar', () => {
        const { header, scrim, drawer, content } = mountFrame();
        const { rerender } = renderHook(({ open }: { open: boolean }) => useInertBackground(open, 'drawer'), { initialProps: { open: false } });
        expect(header).not.toHaveAttribute('inert');

        rerender({ open: true });
        expect(header).toHaveAttribute('inert');
        expect(content).toHaveAttribute('inert');
        expect(drawer).not.toHaveAttribute('inert');
        expect(scrim).not.toHaveAttribute('inert');

        rerender({ open: false });
        expect(header).not.toHaveAttribute('inert');
        expect(content).not.toHaveAttribute('inert');
    });

    it('desmontar com a gaveta aberta também desfaz o inert', () => {
        const { header } = mountFrame();
        const { unmount } = renderHook(() => useInertBackground(true, 'drawer'));
        expect(header).toHaveAttribute('inert');

        unmount();
        expect(header).not.toHaveAttribute('inert');
    });
});
