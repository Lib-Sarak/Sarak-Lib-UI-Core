import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PreviewCanvas } from '../PreviewCanvas';
import { SarakUIContextType } from '../../../../core/Provider/types';

/**
 * plan-36 — MEDIÇÃO isolada da estabilização do `design` do DesignScope EXTERNO
 * (`PreviewCanvas.tsx`). O teste em `PreviewCanvas.test.tsx` que passa pelo
 * `SarakUIProvider` real é contaminado por OUTRAS fontes de `computeColorVariants`
 * (o próprio `DesignInjector` de nível superior do Provider, efeitos assíncronos)
 * — aqui a árvore é mínima e determinística: `useSarakUI` e `DesignScope` mockados,
 * só capturando a REFERÊNCIA do `design` recebido a cada render.
 */
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<unknown>) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>,
}));

vi.mock('../../../../core/Provider/SarakUIProvider', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../../core/Provider/SarakUIProvider')>();
    return { ...actual, useSarakUI: vi.fn(() => ({})) };
});

const capturedDesigns: unknown[] = [];
vi.mock('../../../../core/Design/components/DesignScope', () => ({
    DesignScope: ({ design, children }: { design: unknown; children: React.ReactNode }) => {
        capturedDesigns.push(design);
        return <div data-testid="design-scope-mock">{children}</div>;
    },
}));

vi.mock('../components/PresetsCatalog', () => ({ PresetsCatalog: () => <div /> }));
vi.mock('../components/LiveDraftPreviewFrame', () => ({
    LiveDraftPreviewFrame: ({ children }: React.PropsWithChildren<unknown>) => <div>{children}</div>,
}));
vi.mock('../components/PreviewSystemRenderer', () => ({ PreviewSystemRenderer: () => <div /> }));

const baseProps = (draftTokens: Record<string, unknown>) => ({
    previewDevice: 'desktop' as const,
    previewLayoutId: 'test',
    activePreviewApp: 'dashboard',
    setActivePreviewApp: () => {},
    previewAnimationStyle: 'none',
    previewEmojiSet: 'apple',
    config: {},
    previewPrimaryColor: '#000',
    mode: 'light',
    draftTokens,
    onUpdateDraft: () => {},
    sarak: {} as unknown as SarakUIContextType,
    isDualView: true,
    isPreviewStacked: false,
});

describe('PreviewCanvas — estabilidade do `design` do DesignScope externo (plan-36)', () => {
    it('MEDIÇÃO: um re-render que NÃO muda `draftTokens` entrega a MESMA referência de `design` — antes desta plan, era um literal novo a cada render', () => {
        capturedDesigns.length = 0;
        const draftTokens = { sidebarWidth: 250, primaryColor: '#00f2ff' };

        const { rerender } = render(<PreviewCanvas {...baseProps(draftTokens)} />);
        expect(capturedDesigns).toHaveLength(1);

        // Re-render disparado por algo alheio ao rascunho — MESMA referência de `draftTokens`.
        rerender(<PreviewCanvas {...baseProps(draftTokens)} />);
        expect(capturedDesigns).toHaveLength(2);

        expect(capturedDesigns[1]).toBe(capturedDesigns[0]);
    });

    it('quando `draftTokens` MUDA de verdade (novo objeto), o `design` recebido também é uma referência NOVA', () => {
        capturedDesigns.length = 0;
        const { rerender } = render(<PreviewCanvas {...baseProps({ sidebarWidth: 250 })} />);
        expect(capturedDesigns).toHaveLength(1);

        rerender(<PreviewCanvas {...baseProps({ sidebarWidth: 260 })} />);
        expect(capturedDesigns).toHaveLength(2);

        expect(capturedDesigns[1]).not.toBe(capturedDesigns[0]);
        expect((capturedDesigns[1] as Record<string, unknown>).sidebarWidth).toBe(260);
    });

    it('o `design` sempre carrega `globalBackgroundImageUrl: undefined` — a fronteira externa continua não pintando o fundo do rascunho (comportamento preservado)', () => {
        capturedDesigns.length = 0;
        render(<PreviewCanvas {...baseProps({ globalBackgroundImageUrl: 'https://example.com/bg.png' })} />);

        expect((capturedDesigns[0] as Record<string, unknown>).globalBackgroundImageUrl).toBeUndefined();
    });
});
