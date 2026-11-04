import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { CARD_PRESETS } from '../../../../core/Design/presets/components/cards';
import { usePresetText } from '../usePresetText';

const inLanguage = (language: string) => ({
    wrapper: ({ children }: { children: React.ReactNode }) => React.createElement(SarakUIProvider, { options: { i18n: { languages: [language], language } }, children }),
});

describe('usePresetText', () => {
    it('sem Provider, o texto sai em português', () => {
        const { result } = renderHook(() => usePresetText());
        expect(result.current.preset(CARD_PRESETS[0]).name).toBe('Vidro mínimo');
        expect(result.current.group('sidebar')).toBe('Barra lateral');
        expect(result.current.ui('seeAllCount', { count: 9 })).toBe('Ver todas (9)');
    });

    it('com o idioma do sistema, o nome e o título acompanham', () => {
        const { result } = renderHook(() => usePresetText(), inLanguage('en'));
        expect(result.current.preset(CARD_PRESETS[0]).name).not.toBe('Vidro mínimo');
        expect(result.current.group('sidebar')).not.toBe('Barra lateral');
        expect(result.current.family('technical')).not.toBe('Técnicas');
    });
});
