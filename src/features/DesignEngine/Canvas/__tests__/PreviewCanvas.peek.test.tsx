import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { PreviewCanvas } from '../PreviewCanvas';
import { SarakUIContextType } from '../../../../core/Provider/types';

/**
 * A espiada compõe a opção por cima do rascunho SÓ na prévia grande: a galeria e o escopo externo seguem o rascunho,
 * e nada passa por `onUpdateDraft` (não conta como mudança).
 */
vi.mock('framer-motion', () => ({
    motion: { div: ({ children, ...props }: React.PropsWithChildren<unknown>) => <div {...props}>{children}</div> },
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>,
}));

vi.mock('../../../../core/Provider/SarakUIProvider', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../../core/Provider/SarakUIProvider')>();
    return { ...actual, useSarakUI: vi.fn(() => ({})) };
});

const outerDesigns: unknown[] = [];
vi.mock('../../../../core/Design/components/DesignScope', () => ({
    SarakDesignScope: ({ design, children }: { design: unknown; children: React.ReactNode }) => {
        outerDesigns.push(design);
        return <div>{children}</div>;
    },
}));

const rendererTokens: unknown[] = [];
vi.mock('../components/LiveDraftPreviewFrame', () => ({
    LiveDraftPreviewFrame: ({ children }: React.PropsWithChildren<unknown>) => <div>{children}</div>,
}));
vi.mock('../components/PreviewSystemRenderer', () => ({
    PreviewSystemRenderer: ({ tokens }: { tokens: unknown }) => { rendererTokens.push(tokens); return <div />; },
}));

const draft = { primaryColor: '#111111', mode: 'light' };

const renderCanvas = (extra: Record<string, unknown>) => {
    const onUpdateDraft = vi.fn();
    render(
        <PreviewCanvas
            previewDevice="desktop"
            previewLayoutId="test"
            activePreviewApp="dashboard"
            selectPreviewApp={() => {}}
            previewAnimationStyle="none"
            config={{}}
            previewPrimaryColor="#000"
            draftTokens={draft}
            onUpdateDraft={onUpdateDraft}
            sarak={{} as unknown as SarakUIContextType}
            {...extra}
        />,
    );
    return { onUpdateDraft };
};

describe('PreviewCanvas — espiada', () => {
    beforeEach(() => { outerDesigns.length = 0; rendererTokens.length = 0; });

    it('a prévia grande recebe a opção por cima do rascunho; o escopo externo segue o rascunho', () => {
        const { onUpdateDraft } = renderCanvas({ peekTokens: { primaryColor: '#ff0000', radius: 4 } });

        expect(rendererTokens.at(-1)).toMatchObject({ primaryColor: '#ff0000', radius: 4, mode: 'light' });
        expect(outerDesigns.at(-1)).toMatchObject({ primaryColor: '#111111' });
        expect(onUpdateDraft).not.toHaveBeenCalled();
    });

    it('sem espiada a prévia é o rascunho puro', () => {
        renderCanvas({ peekTokens: null });
        expect(rendererTokens.at(-1)).toMatchObject({ primaryColor: '#111111' });
    });
});
