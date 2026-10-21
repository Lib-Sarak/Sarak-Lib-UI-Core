/**
 * useSarakStylesheetGuard (Spec 08 §2 + Spec 24).
 *
 * O Provider injeta CSS global durante a montagem no Modo App. No Modo Embarcado a
 * folha global não é criada; esta guarda remove uma folha preexistente antes do paint.
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSarakStylesheetGuard } from '../useSarakStylesheetGuard';
import { injectSarakStyles } from '../../injectStyles';
import { SARAK_MODE_ATTRIBUTE } from '../../scope';

const STYLE_TAG_ID = 'sarak-ui-core-styles';
const tagGlobal = (): HTMLElement | null => document.getElementById(STYLE_TAG_ID);

/** Instala uma folha global para exercitar a guarda do modo embarcado. */
const injetarCssGlobal = (): void => {
    document.documentElement.removeAttribute(SARAK_MODE_ATTRIBUTE);
    injectSarakStyles(':root{--sarak-ui-core-css-loaded:1}');
};

beforeEach(() => {
    tagGlobal()?.remove();
    document.documentElement.removeAttribute(SARAK_MODE_ATTRIBUTE);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useSarakStylesheetGuard', () => {
    it('Modo Embarcado: remove o stylesheet GLOBAL do `<head>`', () => {
        injetarCssGlobal();
        expect(tagGlobal()).not.toBeNull();

        renderHook(() => useSarakStylesheetGuard('embedded', document.createElement('div')));

        expect(tagGlobal()).toBeNull();
    });

    it('Modo Embarcado: avisa como evitar o flash (marcação no documento)', () => {
        injetarCssGlobal();
        renderHook(() => useSarakStylesheetGuard('embedded', document.createElement('div')));

        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(SARAK_MODE_ATTRIBUTE));
    });

    it('Modo Embarcado: sem CSS global no head, não avisa nada', () => {
        renderHook(() => useSarakStylesheetGuard('embedded', document.createElement('div')));
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('Modo Embarcado: aponta a variante ESCOPADA quando o CSS não chegou na ilha', () => {
        renderHook(() => useSarakStylesheetGuard('embedded', document.createElement('div')));
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('sarak-scoped.css'));
    });

    it('Modo App: preserva o stylesheet global (é ele que estiliza a página)', () => {
        injetarCssGlobal();
        renderHook(() => useSarakStylesheetGuard('app', null));
        expect(tagGlobal()).not.toBeNull();
    });

    it('Modo App: sem CSS detectado, aponta a variante GLOBAL', () => {
        renderHook(() => useSarakStylesheetGuard('app', null));
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('@sarak/lib-ui-core/dist/sarak.css'),
        );
    });
});

describe('injectSarakStyles — dica de modo no documento', () => {
    it('não injeta o CSS global quando o documento está marcado como embarcado', () => {
        document.documentElement.setAttribute(SARAK_MODE_ATTRIBUTE, 'embedded');
        injectSarakStyles(':root{--x:1}');
        expect(tagGlobal()).toBeNull();
    });

    it('injeta normalmente sem marcação (Modo App é o default)', () => {
        injectSarakStyles(':root{--x:1}');
        expect(tagGlobal()).not.toBeNull();
    });
});
