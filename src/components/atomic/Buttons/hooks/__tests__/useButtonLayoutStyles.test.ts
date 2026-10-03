import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useButtonLayoutStyles } from '../useButtonLayoutStyles';

describe('useButtonLayoutStyles', () => {
    it('sem fullWidth e sem estratégia "full", emite w-max min-w-fit (largura dita pelo conteúdo)', () => {
        const { result } = renderHook(() => useButtonLayoutStyles(undefined, false));
        expect(result.current.containerClass).toContain('w-max');
        expect(result.current.containerClass).toContain('min-w-fit');
        expect(result.current.containerClass).not.toContain('w-full');
    });

    it('com fullWidth=true, emite só w-full — sem min-w-fit sobrando (largura cheia não pode carregar piso de min-width)', () => {
        const { result } = renderHook(() => useButtonLayoutStyles(undefined, true));
        expect(result.current.containerClass).toContain('w-full');
        expect(result.current.containerClass).not.toContain('min-w-fit');
        expect(result.current.containerClass).not.toContain('w-max');
    });

    it('com buttonWidthStrategy do tema = "full" (sem fullWidth de instância), também não sobra min-w-fit', () => {
        const { result } = renderHook(() => useButtonLayoutStyles({ buttonWidthStrategy: 'full' }));
        expect(result.current.containerClass).toContain('w-full');
        expect(result.current.containerClass).not.toContain('min-w-fit');
    });

    it('com w-full pedido só pela className do chamador (sem fullWidth nem estratégia do tema), também não sobra min-w-fit', () => {
        const { result } = renderHook(() => useButtonLayoutStyles(undefined, false, 'w-full mt-2'));
        expect(result.current.containerClass).toContain('w-full');
        expect(result.current.containerClass).not.toContain('min-w-fit');
        expect(result.current.containerClass).not.toContain('w-max');
    });

    it('className com uma classe que só CONTÉM "w-full" como substring não conta como largura cheia', () => {
        const { result } = renderHook(() => useButtonLayoutStyles(undefined, false, 'not-w-fullish'));
        expect(result.current.containerClass).toContain('min-w-fit');
        expect(result.current.containerClass).not.toContain('w-full');
    });

    it('buttonIconPosition "right" inverte a ordem do ícone', () => {
        const { result } = renderHook(() => useButtonLayoutStyles({ buttonIconPosition: 'right' }));
        expect(result.current.iconOrderClass).toBe('flex-row-reverse');
    });

    it('buttonIconPosition default ("left" / ausente) mantém a ordem normal', () => {
        const { result } = renderHook(() => useButtonLayoutStyles(undefined));
        expect(result.current.iconOrderClass).toBe('flex-row');
    });
});
