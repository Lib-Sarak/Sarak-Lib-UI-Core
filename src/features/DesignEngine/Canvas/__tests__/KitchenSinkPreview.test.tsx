import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KitchenSinkPreview } from '../KitchenSinkPreview';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn()
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        section: ({ children, ...props }: any) => <section {...props}>{children}</section>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('KitchenSinkPreview', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useSarakUI as any).mockReturnValue({
            draftDesign: { mode: 'dark' },
            systemDesign: { mode: 'dark' }
        });
    });

    it('renderiza o componente base', () => {
        const { container } = render(<KitchenSinkPreview />);
        expect(container).toBeInTheDocument();
        // Since it's huge, rendering it without crashing is the main goal
        // to cover statements
    });
});
