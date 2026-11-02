import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SampleScope } from '../SampleScope';

describe('SampleScope', () => {
    it('segue o modo pedido, nunca um tema escuro fixo', () => {
        const light = render(<SampleScope tokens={{}} mode="light"><span /></SampleScope>);
        const dark = render(<SampleScope tokens={{}} mode="dark"><span /></SampleScope>);

        expect(light.container.querySelector('.sarak-design-scope')).toHaveClass('light');
        expect(dark.container.querySelector('.sarak-design-scope')).toHaveClass('dark');
    });

    it('a opção vale por cima do rascunho e a mídia de fundo do rascunho não vem junto', () => {
        const { container } = render(
            <SampleScope
                draft={{ primaryColor: '#111111', radius: 4, globalBackgroundImageUrl: 'https://exemplo.test/fundo.mp4' } as never}
                tokens={{ primaryColor: '#ff0000' }}
                mode="dark"
            >
                <span />
            </SampleScope>,
        );
        const scope = container.querySelector('.sarak-design-scope') as HTMLElement;

        expect(scope.style.getPropertyValue('--sarak-primary-color')).toMatch(/#ff0000|rgb\(255, 0, 0\)/i);
        expect(container.querySelector('video')).toBeNull();
    });

    it('transparent tira o fundo do escopo para a atmosfera aparecer atrás', () => {
        const solid = render(<SampleScope tokens={{}} mode="dark"><span /></SampleScope>);
        const clear = render(<SampleScope tokens={{}} mode="dark" transparent><span /></SampleScope>);

        expect((solid.container.querySelector('.sarak-design-scope') as HTMLElement).style.backgroundColor).toBe('var(--sarak-bg-base)');
        expect((clear.container.querySelector('.sarak-design-scope') as HTMLElement).style.backgroundColor).toBe('');
    });
});

describe('SampleScope — as cores vêm do escopo, não do :root', () => {
    it('o texto e o fundo leem variáveis do escopo; as classes text-theme-* e bg-theme-* resolvem em :root e não mudam dentro dele', () => {
        const { container } = render(<SampleScope tokens={{}} mode="dark"><span /></SampleScope>);
        const scope = container.querySelector('.sarak-design-scope') as HTMLElement;

        expect(scope.style.color).toBe('var(--sarak-text-main)');
        expect(scope.className).not.toMatch(/(text|bg)-theme-/);
    });
});
