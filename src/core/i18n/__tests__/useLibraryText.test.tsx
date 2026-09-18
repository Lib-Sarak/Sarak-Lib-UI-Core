import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLibraryText, resolveLibraryLanguage } from '../useLibraryText';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';

describe('resolveLibraryLanguage', () => {
    it('idioma fora dos seis oferecidos, ou ausente, cai em português', () => {
        expect(resolveLibraryLanguage('xx')).toBe('pt');
        expect(resolveLibraryLanguage(undefined)).toBe('pt');
        expect(resolveLibraryLanguage(null)).toBe('pt');
    });

    it('idioma dos seis oferecidos é aceito', () => {
        expect(resolveLibraryLanguage('en')).toBe('en');
        expect(resolveLibraryLanguage('es')).toBe('es');
    });
});

describe('useLibraryText — o texto da própria lib no idioma que vale', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('sem Provider: nunca lança, e o texto sai em português (R34)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { result } = renderHook(() => useLibraryText());
        expect(result.current('searchCloseHint')).toBe('Fechar');
        warnSpy.mockRestore();
    });

    it('com Provider, mas sem idioma escolhido, o texto sai em português (a base da lib)', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SarakUIProvider>{children}</SarakUIProvider>
        );
        const { result } = renderHook(() => useLibraryText(), { wrapper });
        expect(result.current('searchCloseHint')).toBe('Fechar');
    });

    it('com Provider e `config.language: "en"`, lê o inglês', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SarakUIProvider config={{ language: 'en' }}>{children}</SarakUIProvider>
        );
        const { result } = renderHook(() => useLibraryText(), { wrapper });
        expect(result.current('searchCloseHint')).toBe('Close');
    });

    it('interpola variáveis no template', () => {
        const { result } = renderHook(() => useLibraryText());
        expect(result.current('searchNoResultsFor', { query: 'abc' })).toBe('Nenhum resultado para "abc"');
    });
});
