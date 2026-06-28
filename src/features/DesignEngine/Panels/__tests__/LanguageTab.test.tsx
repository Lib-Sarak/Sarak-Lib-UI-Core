import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageTab } from '../LanguageTab';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn(() => ({
        language: 'pt-BR',
        enabledLanguages: ['pt-BR', 'en-US'],
        availableLanguages: [{ id: 'pt-BR', name: 'Português' }, { id: 'en-US', name: 'English' }],
        applyConfig: vi.fn()
    }))
}));

describe('LanguageTab', () => {
    it('matches baseline snapshot', () => {
        const { asFragment } = render(<LanguageTab />);
        expect(asFragment()).toMatchSnapshot();
    });
});
