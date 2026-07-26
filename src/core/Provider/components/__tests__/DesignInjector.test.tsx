import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesignInjector } from '../DesignInjector';
import * as useDesignVariablesHook from '../../../Design/hooks/useDesignVariables';

// Mock do hook
vi.mock('../../../Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn()
}));

/** Título que o `index.html` do host definiria — o DesignInjector não pode tocá-lo. */
const HOST_TITLE = 'App do Host — intocado';

describe('DesignInjector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Limpar os estilos e atributos do document antes de cada teste
        document.documentElement.style.cssText = '';
        document.body.style.cssText = '';
        document.documentElement.removeAttribute('data-test');
        document.body.removeAttribute('data-test');
        document.body.className = '';
        document.body.removeAttribute('data-sarak-has-media');
        
        const styleTag = document.getElementById('sarak-responsive-vars');
        if (styleTag) styleTag.remove();

        document.title = HOST_TITLE;
    });

    it('injeta variáveis, atributos e responsiveCSS no DOM', () => {
        const mockVars = {
            '--test-var': '10px'
        };
        const mockAttrs = {
            'data-test': 'active'
        };
        const mockResponsive = '@media (max-width: 768px) { :root { --test-var: 5px; } }';

        (useDesignVariablesHook.useDesignVariables as any).mockReturnValue({
            variables: mockVars,
            attributes: mockAttrs,
            responsiveCSS: mockResponsive
        });

        const design = { mode: 'dark', systemName: 'Test App', globalBackgroundImageUrl: 'url(test.jpg)' };

        render(<DesignInjector design={design} isDrafting={false} />);

        // Testa CSS Variables
        expect(document.documentElement.style.getPropertyValue('--test-var')).toBe('10px');
        expect(document.body.style.getPropertyValue('--test-var')).toBe('10px');

        // Testa Atributos
        expect(document.documentElement.getAttribute('data-test')).toBe('active');
        expect(document.body.getAttribute('data-test')).toBe('active');

        // Testa Classes Mode
        expect(document.body.classList.contains('dark')).toBe(true);

        // Título: NÃO é responsabilidade deste componente (Spec 47 — fonte única no
        // `useSarakUIEffects`). Mesmo com `systemName` no design, o DesignInjector
        // deixa o `<title>` do host exatamente como estava.
        expect(document.title).toBe(HOST_TITLE);

        // Testa Media
        expect(document.body.getAttribute('data-sarak-has-media')).toBe('true');

        // Testa style tag
        const styleTag = document.getElementById('sarak-responsive-vars');
        expect(styleTag).not.toBeNull();
        expect(styleTag?.innerHTML).toBe(mockResponsive);
    });

    it('remove data-sarak-has-media se não houver background image e aplica modo fallback', () => {
        (useDesignVariablesHook.useDesignVariables as any).mockReturnValue({
            variables: {},
            attributes: {},
            responsiveCSS: null
        });

        const design = { mode: undefined }; // sem modo e sem media => fallback 'dark', sem data-sarak-has-media

        render(<DesignInjector design={design} isDrafting={false} />);

        expect(document.body.classList.contains('dark')).toBe(true);
        expect(document.body.hasAttribute('data-sarak-has-media')).toBe(false);
    });

    it('L5: ancora a fonte do tema INLINE no body (Modo App) — vence reset do consumidor', () => {
        (useDesignVariablesHook.useDesignVariables as any).mockReturnValue({
            variables: { '--font-main': "'Space Grotesk', sans-serif" },
            attributes: {},
            responsiveCSS: null,
        });
        // Simula um reset de scaffold do consumidor: body já tem uma família.
        document.body.style.fontFamily = 'system-ui';

        render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} />);

        // A lib sobrepõe com a var do tema (inline vence a cascata da folha do consumidor).
        expect(document.body.style.fontFamily).toContain('var(--font-main');
    });

    it('L5: Modo Embarcado ancora a fonte no container da ilha, nunca no body do host', () => {
        (useDesignVariablesHook.useDesignVariables as any).mockReturnValue({
            variables: { '--font-main': "'Space Grotesk', sans-serif" },
            attributes: {},
            responsiveCSS: null,
        });
        document.body.style.fontFamily = 'system-ui';
        const island = document.createElement('div');
        document.body.appendChild(island);

        render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} mode="embedded" scopeElement={island} />);

        expect(island.style.fontFamily).toContain('var(--font-main');
        // O body do host permanece intocado (isolamento do Modo Embarcado).
        expect(document.body.style.fontFamily).toBe('system-ui');
        island.remove();
    });

    it('não injeta nada se design não for fornecido', () => {
        (useDesignVariablesHook.useDesignVariables as any).mockReturnValue({
            variables: {},
            attributes: {},
            responsiveCSS: null
        });

        render(<DesignInjector design={null} isDrafting={false} />);
        
        expect(document.body.className).toBe(''); // nada foi injetado
    });
});
