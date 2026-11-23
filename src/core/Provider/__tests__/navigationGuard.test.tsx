import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    SarakNavigationGuardProvider,
    useGuardedNavigate,
    useRegisterNavigationGuard,
    type SarakNavigationGuard,
} from '../navigationGuard';

type Navigate = (route: string) => void;

const Probe: React.FC<{ guard: SarakNavigationGuard | null; onNavigate?: Navigate; expose: (go?: Navigate) => void }> = ({ guard, onNavigate, expose }) => {
    useRegisterNavigationGuard(guard);
    expose(useGuardedNavigate(onNavigate));
    return null;
};

const mount = (guard: SarakNavigationGuard | null, onNavigate?: Navigate) => {
    let go: Navigate | undefined;
    const view = render(
        <SarakNavigationGuardProvider>
            <Probe guard={guard} onNavigate={onNavigate} expose={(fn) => { go = fn; }} />
        </SarakNavigationGuardProvider>,
    );
    return { go: () => go, ...view };
};

describe('navigationGuard', () => {
    it('sem guarda registrado, navega na hora (síncrono)', () => {
        const onNavigate = vi.fn();
        mount(null, onNavigate).go()!('/a');
        expect(onNavigate).toHaveBeenCalledWith('/a');
    });

    it('com guarda, só navega depois da resposta `true`', async () => {
        const onNavigate = vi.fn();
        let answer!: (value: boolean) => void;
        const guard = vi.fn(() => new Promise<boolean>((resolve) => { answer = resolve; }));
        const { go } = mount(guard, onNavigate);

        go()!('/a');
        expect(guard).toHaveBeenCalledTimes(1);
        expect(onNavigate).not.toHaveBeenCalled();

        await act(async () => { answer(true); });
        expect(onNavigate).toHaveBeenCalledWith('/a');
    });

    it('guarda que responde `false` mantém quem pediu onde está', async () => {
        const onNavigate = vi.fn();
        const { go } = mount(() => Promise.resolve(false), onNavigate);
        await act(async () => { go()!('/a'); });
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('sem guarda de novo (rascunho resolvido), a navegação volta a ser imediata', () => {
        const onNavigate = vi.fn();
        const guard = vi.fn(() => Promise.resolve(false));
        const { go, rerender } = mount(guard, onNavigate);
        rerender(
            <SarakNavigationGuardProvider>
                <Probe guard={null} onNavigate={onNavigate} expose={() => undefined} />
            </SarakNavigationGuardProvider>,
        );
        go()!('/a');
        expect(guard).not.toHaveBeenCalled();
        expect(onNavigate).toHaveBeenCalledWith('/a');
    });

    it('sem `onNavigate` do host, não inventa um (o cromo mantém o item sem ação)', () => {
        expect(mount(null, undefined).go()).toBeUndefined();
    });

    it('fora do Provider, é transparente', () => {
        const onNavigate = vi.fn();
        let go: Navigate | undefined;
        render(<Probe guard={() => Promise.resolve(false)} onNavigate={onNavigate} expose={(fn) => { go = fn; }} />);
        go!('/a');
        expect(onNavigate).toHaveBeenCalledWith('/a');
    });
});
