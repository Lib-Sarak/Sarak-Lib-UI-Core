/**
 * O token `reducedMotion` chega ao `framer-motion`: o Provider monta um `MotionConfig` que o liga em `always`
 * com o token ligado, e em `user` (obedece o sistema operacional) com ele desligado. O CSS do mesmo token e o
 * de `prefers-reduced-motion` são cobrados em `src/styles/__tests__/toqueEMovimento.test.ts`.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MotionConfigContext } from 'framer-motion';
import { describe, it, expect } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';

/** Lê a política que o `MotionConfig` do Provider entrega às animações do framer-motion. */
const Probe: React.FC<{ onValue: (value: string | undefined) => void }> = ({ onValue }) => {
    onValue(React.useContext(MotionConfigContext).reducedMotion);
    return null;
};

const readReducedMotion = (config: Record<string, unknown>): string | undefined => {
    let seen: string | undefined;
    render(
        <SarakUIProvider config={config}>
            <Probe onValue={(value) => { seen = value; }} />
        </SarakUIProvider>,
    );
    return seen;
};

describe('SarakUIProvider — movimento reduzido', () => {
    it('com o token ligado, o framer-motion reduz o movimento sempre', () => {
        expect(readReducedMotion({ reducedMotion: true })).toBe('always');
    });

    it('com o token desligado, o framer-motion segue a preferência do sistema operacional', () => {
        expect(readReducedMotion({ reducedMotion: false })).toBe('user');
    });

    it('o atributo que o CSS lê acompanha o token', () => {
        render(<SarakUIProvider config={{ reducedMotion: true }}><span /></SarakUIProvider>);
        expect(document.documentElement.getAttribute('data-sx-reduced-motion')).toBe('true');
    });
});
