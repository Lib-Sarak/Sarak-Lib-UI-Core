import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../ShellContent';
import { ShellContent } from '../ShellContent';
import { BREAKPOINT_DESKTOP } from '../../../Design/breakpoints';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';

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

    // os textos da própria lib seguem o idioma que vale.
    describe('idioma que vale', () => {
        const activeModule = { id: 'mod1', label: 'Módulo Um', icon: 'Box', status: 'online', priority: 1 } as any;

        it('categoria ausente e modo API saem em português por padrão', () => {
            render(
                <ShellContent
                    activeModule={activeModule}
                    discoveredModules={[activeModule]}
                    design={{}}
                    setIsSearchOpen={vi.fn()}
                />,
            );
            expect(screen.getByText('Módulo')).toBeInTheDocument();
            expect(screen.getByText('Módulo em modo API (sem interface local)')).toBeInTheDocument();
        });

        it('categoria ausente e modo API saem em inglês com `config.language: "en"`', () => {
            render(
                <SarakUIProvider config={{ language: 'en' }}>
                    <ShellContent
                        activeModule={activeModule}
                        discoveredModules={[activeModule]}
                        design={{ language: 'en' }}
                        setIsSearchOpen={vi.fn()}
                    />
                </SarakUIProvider>,
            );
            expect(screen.getByText('Module')).toBeInTheDocument();
            expect(screen.getByText('Module in API mode (no local interface)')).toBeInTheDocument();
        });
    });
});
