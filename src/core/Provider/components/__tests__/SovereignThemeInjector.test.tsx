import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SovereignThemeInjector } from '../SovereignThemeInjector';

describe('SovereignThemeInjector', () => {
    it('returns null if manifest sovereignHijack is false', () => {
        const { container } = render(
            <SovereignThemeInjector design={{ mode: 'light' }} manifest={{ sovereignHijack: false }} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('injects light mode hijack styles when mode is light', () => {
        const { container } = render(
            <SovereignThemeInjector design={{ mode: 'light' }} manifest={{ sovereignHijack: true }} />
        );
        const styleEl = container.querySelector('#sarak-sovereign-bridge');
        expect(styleEl).not.toBeNull();
        expect(styleEl?.innerHTML).toContain('Sarak Sovereign Bridge - Light Mode Hijack');
        expect(styleEl?.innerHTML).toContain('body.light .text-white');
    });

    it('injects dark mode hue hijack styles when mode is dark', () => {
        const { container } = render(
            <SovereignThemeInjector design={{ mode: 'dark' }} manifest={{ sovereignHijack: true }} />
        );
        const styleEl = container.querySelector('#sarak-sovereign-bridge');
        expect(styleEl).not.toBeNull();
        expect(styleEl?.innerHTML).toContain('Sarak Sovereign Bridge - Dark Mode Hue Hijack');
        expect(styleEl?.innerHTML).toContain('body.dark .bg-zinc-950');
    });

    it('defaults to dark mode hijack if mode is undefined', () => {
        const { container } = render(
            <SovereignThemeInjector design={{}} manifest={{}} />
        );
        const styleEl = container.querySelector('#sarak-sovereign-bridge');
        expect(styleEl?.innerHTML).toContain('Sarak Sovereign Bridge - Dark Mode Hue Hijack');
    });
});
