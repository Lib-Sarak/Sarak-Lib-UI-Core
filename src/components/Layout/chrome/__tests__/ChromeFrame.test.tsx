import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ChromeFrame } from '../ChromeFrame';

const ROOT_STYLE: React.CSSProperties = { minHeight: '100dvh' };

describe('ChromeFrame (Spec 48 — L1, moldura comum dos três modos de cromo)', () => {
    it('sem slots: a raiz não ganha NADA além do corpo (zero mudança estrutural)', () => {
        const { container } = render(
            <ChromeFrame rootStyle={ROOT_STYLE}><div>corpo</div></ChromeFrame>,
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.children.length).toBe(1);
        expect(root.textContent).toBe('corpo');
        // Contexto de empilhamento só existe quando há decoração.
        expect(root.style.position).toBe('');
        expect(root.style.isolation).toBe('');
        expect(root.style.minHeight).toBe('100dvh');
    });

    it('ordem fixa em qualquer modo: decoração → banner → corpo → footer', () => {
        const { container } = render(
            <ChromeFrame
                rootStyle={ROOT_STYLE}
                decoration={<span>d</span>}
                banner={<span>b</span>}
                footer={<span>f</span>}
            >
                <div data-testid="corpo">corpo</div>
            </ChromeFrame>,
        );
        const root = container.firstElementChild as HTMLElement;
        const slots = [...root.children].map((el) => el.getAttribute('data-sarak-slot') ?? 'corpo');
        expect(slots).toEqual(['decoration', 'banner', 'corpo', 'footer']);
    });

    it('com decoração: a raiz vira contexto de empilhamento próprio (a arte fica atrás)', () => {
        const { container } = render(
            <ChromeFrame rootStyle={ROOT_STYLE} decoration={<span>d</span>}><div>corpo</div></ChromeFrame>,
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.style.position).toBe('relative');
        expect(root.style.isolation).toBe('isolate');
        expect(root.style.minHeight).toBe('100dvh');
    });

    it('o `style` do consumidor vence a moldura (uso embarcado)', () => {
        const { container } = render(
            <ChromeFrame rootStyle={{ ...ROOT_STYLE, position: 'static' }} decoration={<span>d</span>}>
                <div>corpo</div>
            </ChromeFrame>,
        );
        expect((container.firstElementChild as HTMLElement).style.position).toBe('static');
    });

    it('preserva o className do consumidor na raiz', () => {
        const { container } = render(
            <ChromeFrame rootStyle={ROOT_STYLE} className="minha-classe"><div>corpo</div></ChromeFrame>,
        );
        expect((container.firstElementChild as HTMLElement).className).toContain('minha-classe');
    });
});
