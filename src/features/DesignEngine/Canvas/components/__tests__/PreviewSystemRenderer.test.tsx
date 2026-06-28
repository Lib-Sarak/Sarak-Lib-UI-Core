import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../PreviewSystemRenderer';
import { PreviewSystemRenderer } from '../PreviewSystemRenderer';
import { SarakUIContextType } from '../../../../../core/Provider/types';

// Mocks
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<unknown>) => <div {...props}>{children}</div>,
        section: ({ children, ...props }: React.PropsWithChildren<unknown>) => <section {...props}>{children}</section>,
        aside: ({ children, ...props }: React.PropsWithChildren<unknown>) => <aside {...props}>{children}</aside>
    },
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>
}));

import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

describe('PreviewSystemRenderer', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('should render and match snapshot', () => {
        const { container } = render(
            <SarakUIProvider>
                <PreviewSystemRenderer 
                    previewDevice="desktop"
                    previewNavVisible={true}
                    setPreviewNavVisible={() => {}}
                    isSidebar={true}
                    isDock={false}
                    isTopbar={false}
                    parentContext={{} as unknown as SarakUIContextType}
                    onUpdateDraft={() => {}}
                    mockGroupedModules={{}}
                    mockDiscoveredModules={[]}
                    startResizingTopbar={() => {}}
                    tokens={{}}
                    sarak={{} as unknown as SarakUIContextType}
                    startResizingSidebar={() => {}}
                    apps={{ dashboard: <div>Mock App</div> }}
                    activePreviewApp="dashboard"
                    setActivePreviewApp={() => {}}
                />
            </SarakUIProvider>
        );
        expect(container).toMatchSnapshot();
    });
});
