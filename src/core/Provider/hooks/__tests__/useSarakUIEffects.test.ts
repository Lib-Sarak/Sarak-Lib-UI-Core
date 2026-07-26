/**
 * `useSarakUIEffects` — fonte ÚNICA da identidade da aba (Spec 47).
 *
 * O gate de integração (o caminho que o dono valida no browser) vive em
 * `__tests__/HostIdentity.test.tsx`, pelo Provider real. Aqui exercitamos o hook
 * isolado, para fixar a REGRA de precedência sem depender do resto do Provider.
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSarakUIEffects } from '../useSarakUIEffects';
import type { BrandingState } from '../useBrandingManager';

const HOST_TITLE = 'Título do Host';

/** Branding sem identidade — o formato do `DEFAULT_BRANDING` pós-Spec 47. */
const NEUTRAL_BRANDING: BrandingState = { loginName: 'Acesso ao Sistema', logoBase64: null };

beforeEach(() => {
    document.title = HOST_TITLE;
});

describe('useSarakUIEffects — `document.title`', () => {
    it('não escreve nada quando não há branding nem systemName', () => {
        renderHook(() => useSarakUIEffects(undefined, 'app', false, undefined));
        expect(document.title).toBe(HOST_TITLE);
    });

    it('não escreve nada com branding neutro (defaults sem identidade)', () => {
        renderHook(() => useSarakUIEffects(NEUTRAL_BRANDING, 'app', false, undefined));
        expect(document.title).toBe(HOST_TITLE);
    });

    it('escreve o `tabName` quando fornecido', () => {
        const branding: BrandingState = { ...NEUTRAL_BRANDING, tabName: 'Aba do Cliente' };
        renderHook(() => useSarakUIEffects(branding, 'app', false, undefined));
        expect(document.title).toBe('Aba do Cliente');
    });

    it('escreve o `systemName` quando é a única porta preenchida', () => {
        renderHook(() => useSarakUIEffects(NEUTRAL_BRANDING, 'app', false, 'Sistema do Cliente'));
        expect(document.title).toBe('Sistema do Cliente');
    });

    it('precedência: `tabName` (específico) vence `systemName` (genérico)', () => {
        const branding: BrandingState = { ...NEUTRAL_BRANDING, tabName: 'Aba' };
        renderHook(() => useSarakUIEffects(branding, 'app', false, 'Sistema'));
        expect(document.title).toBe('Aba');
    });

    it('Modo Embarcado: não escreve o título nem com valor fornecido', () => {
        const branding: BrandingState = { ...NEUTRAL_BRANDING, tabName: 'Aba da Ilha' };
        renderHook(() => useSarakUIEffects(branding, 'embedded', false, 'Sistema da Ilha'));
        expect(document.title).toBe(HOST_TITLE);
    });
});

describe('useSarakUIEffects — favicon', () => {
    const HOST_FAVICON = '/favicon-do-host.ico';

    beforeEach(() => {
        document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = HOST_FAVICON;
        document.head.appendChild(link);
    });

    const currentFavicon = () =>
        document.querySelector<HTMLLinkElement>("link[rel~='icon']")?.getAttribute('href');

    it('preserva o favicon do host quando não há `logoBase64`', () => {
        renderHook(() => useSarakUIEffects(NEUTRAL_BRANDING, 'app', false, 'Sistema'));
        expect(currentFavicon()).toBe(HOST_FAVICON);
    });

    it('troca o favicon quando o consumidor fornece `logoBase64`', () => {
        const LOGO = 'data:image/png;base64,iVBORw0KGgo=';
        const branding: BrandingState = { ...NEUTRAL_BRANDING, logoBase64: LOGO };
        renderHook(() => useSarakUIEffects(branding, 'app', false, undefined));
        expect(currentFavicon()).toBe(LOGO);
    });
});
