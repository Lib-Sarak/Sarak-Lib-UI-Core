import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../ShellContent';
import { ShellContent } from '../ShellContent';
import { BREAKPOINT_DESKTOP } from '../../../Design/breakpoints';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual as any,
        AnimatePresence: ({ children }: any) => <>{children}</>,
        motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> }
    };
});

vi.mock('../IconRenderer', () => ({ IconRenderer: () => <span data-testid="icon" /> }));

describe('ShellContent', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('as classes de container query do conteúdo são LITERAIS — mesmo número de BREAKPOINT_DESKTOP (plan-39)', () => {
        const activeModule = {
            id: 'mod1', label: 'Módulo Um', icon: 'Box', status: 'online', category: 'system', priority: 1
        } as any;

        const { container } = render(
            <ShellContent
                activeModule={activeModule}
                discoveredModules={[activeModule]}
                design={{}}
                setIsSearchOpen={vi.fn()}
            />,
        );

        const wrapperDiv = container.querySelector('main > div');
        expect(wrapperDiv?.className).toContain(`@min-[${BREAKPOINT_DESKTOP}px]:pt-12`);

        const title = screen.getByText('Módulo Um');
        expect(title.className).toContain(`@min-[${BREAKPOINT_DESKTOP}px]:text-5xl`);
    });
});
