import React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';
import { SarakPortalFrameProvider, useSarakPortalFrame, type SarakPortalFrame } from '../portalFrame';
import { ShellPreferencesMenu } from '../../../components/atomic/Navigation/ShellPreferencesMenu';

vi.mock('../../../components/atomic/Navigation/shellPreferenceRow', () => ({
    renderShellPreferenceRow: (id: string) => <button key={id}>{`item-${id}`}</button>,
}));

describe('useSarakPortalFrame', () => {
    it('sem moldura, o destino é o body e as coordenadas ficam como vêm', () => {
        const { result } = renderHook(() => useSarakPortalFrame());
        expect(result.current.container).toBe(document.body);
        expect(result.current.localize({ top: 10, left: 20 })).toEqual({ top: 10, left: 20 });
    });

    it('com moldura, entrega o nó dela e a conversão dela', () => {
        const node = document.createElement('div');
        const frame: SarakPortalFrame = { container: node, localize: ({ top, left }) => ({ top: top * 2, left: left * 2 }) };
        const { result } = renderHook(() => useSarakPortalFrame(), {
            wrapper: ({ children }) => <SarakPortalFrameProvider value={frame}>{children}</SarakPortalFrameProvider>,
        });
        expect(result.current.container).toBe(node);
        expect(result.current.localize({ top: 1, left: 2 })).toEqual({ top: 2, left: 4 });
    });

    it('moldura ainda sem nó (antes de montar) cai no body', () => {
        const { result } = renderHook(() => useSarakPortalFrame(), {
            wrapper: ({ children }) => <SarakPortalFrameProvider value={{ container: null, localize: (point) => point }}>{children}</SarakPortalFrameProvider>,
        });
        expect(result.current.container).toBe(document.body);
    });
});

describe('ShellPreferencesMenu dentro de uma moldura', () => {
    it('o menu abre no nó da moldura, não no body', async () => {
        const user = userEvent.setup();
        const node = document.createElement('div');
        document.body.appendChild(node);
        const frame: SarakPortalFrame = { container: node, localize: (point) => point };
        render(
            <SarakUIProvider>
                <SarakPortalFrameProvider value={frame}>
                    <ShellPreferencesMenu menuIds={['colorMode']} isNavHidden={false} onToggleNavCollapsed={vi.fn()} />
                </SarakPortalFrameProvider>
            </SarakUIProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Preferências' }));

        const menu = screen.getByRole('menu');
        expect(node.contains(menu)).toBe(true);
        node.remove();
    });

    it('as coordenadas do menu passam pela conversão da moldura', async () => {
        const user = userEvent.setup();
        const node = document.createElement('div');
        document.body.appendChild(node);
        const localize = vi.fn(() => ({ top: 7, left: 9 }));
        render(
            <SarakUIProvider>
                <SarakPortalFrameProvider value={{ container: node, localize }}>
                    <ShellPreferencesMenu menuIds={['colorMode']} isNavHidden={false} onToggleNavCollapsed={vi.fn()} />
                </SarakPortalFrameProvider>
            </SarakUIProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Preferências' }));

        expect(localize).toHaveBeenCalled();
        expect(screen.getByRole('menu')).toHaveStyle({ top: '7px', left: '9px' });
        node.remove();
    });
});
