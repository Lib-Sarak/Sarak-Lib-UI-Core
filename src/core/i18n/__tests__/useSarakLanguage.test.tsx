import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import { useSarakLanguage } from '../useSarakLanguage';
import type { SarakI18nOptions } from '../types';

const wrapperWith = (i18n?: SarakI18nOptions, config: Record<string, unknown> = {}) =>
    ({ children }: { children: React.ReactNode }) => (
        <SarakUIProvider config={config} options={i18n ? { i18n } : undefined}>{children}</SarakUIProvider>
    );

describe('useSarakLanguage', () => {
    it('sem Provider: português, locale pt-BR, setLanguage não lança', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { result } = renderHook(() => useSarakLanguage());
        expect(result.current).toMatchObject({ language: 'pt', locale: 'pt-BR', languages: [] });
        expect(() => result.current.setLanguage('en')).not.toThrow();
    });

    it('controlado: devolve o idioma do sistema e a lista; setLanguage só avisa o sistema', () => {
        const onLanguageChange = vi.fn();
        const { result } = renderHook(() => useSarakLanguage(), {
            wrapper: wrapperWith({ languages: ['pt-BR', { code: 'en-US', label: 'English' }], language: 'pt-BR', onLanguageChange }),
        });
        expect(result.current).toMatchObject({ language: 'pt-BR', locale: 'pt-BR', languages: ['pt-BR', 'en-US'] });
        act(() => result.current.setLanguage('en-US'));
        expect(onLanguageChange).toHaveBeenCalledWith('en-US');
        expect(result.current.language).toBe('pt-BR');
    });

    it('não controlado: grava a preferência e também avisa o sistema', () => {
        const onLanguageChange = vi.fn();
        const { result } = renderHook(() => useSarakLanguage(), {
            wrapper: wrapperWith({ languages: ['pt-BR', 'en-US'], onLanguageChange }, { enabledLanguages: ['pt-BR', 'en-US'], preferenceLanguagePosition: 'menu' }),
        });
        act(() => result.current.setLanguage('en-US'));
        expect(onLanguageChange).toHaveBeenCalledWith('en-US');
        expect(result.current.language).toBe('en-US');
    });

    it('sem options.i18n: segue design.language e lista os idiomas do tema', () => {
        const { result } = renderHook(() => useSarakLanguage(), {
            wrapper: wrapperWith(undefined, { language: 'es', enabledLanguages: ['es', 'en'] }),
        });
        expect(result.current).toMatchObject({ language: 'es', locale: 'es', languages: ['es', 'en'] });
    });
});
