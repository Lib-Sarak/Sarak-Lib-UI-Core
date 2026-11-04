import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreviewCanvasLayout, type PreviewCanvasLayoutProps } from '../PreviewCanvasLayout';
import { getPreviewLayoutPreset } from '../panelResponsive.presets';
import type { SarakUIContextType } from '../../../../core/Provider/types';

vi.mock('../../../../core/Design/components/DesignScope', () => ({
    SarakDesignScope: (props: { children: ReactNode }): ReactNode => props.children,
}));

vi.mock('../../../../core/Provider/components/SarakStyle', () => ({
    SarakStyle: (): null => null,
}));

vi.mock('../components/LiveDraftPreviewFrame', () => ({
    LiveDraftPreviewFrame: (props: { children: ReactNode }): ReactNode => <div data-testid="live-preview-frame">{props.children}</div>,
}));

const createLayoutProps = (): PreviewCanvasLayoutProps => ({
    design: {},
    contextValue: {} as SarakUIContextType,
    previewDevice: 'desktop',
    targetWidth: '100%',
    deviceAspectRatio: undefined,
    getDeviceFrameStyles: () => '',
    isInspecting: false,
    setIsInspecting: () => {},
    previewContent: <span data-testid="preview-content" />,
    layoutPreset: getPreviewLayoutPreset(),
});

describe('PreviewCanvasLayout', () => {
    it('desenha só a prévia: a galeria saiu de cima dela', () => {
        render(<PreviewCanvasLayout {...createLayoutProps()} />);

        expect(screen.getByTestId('live-preview-frame')).toContainElement(screen.getByTestId('preview-content'));
        expect(screen.queryByTestId('catalog-preview-frame')).toBeNull();
    });

    it('a prévia ocupa a área inteira e rola quando não cabe', () => {
        render(<PreviewCanvasLayout {...createLayoutProps()} />);

        const previewLayout = screen.getByTestId('preview-layout');
        expect(previewLayout.className).toContain('overflow-y-auto');
        expect(previewLayout.className).toContain('flex-row');
    });
});
