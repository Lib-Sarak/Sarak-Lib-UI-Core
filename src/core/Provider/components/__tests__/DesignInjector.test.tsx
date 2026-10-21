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

    describe('shadowOrientation: dynamic — a luz segue o ponteiro', () => {
        const moveMouse = (clientX: number, clientY: number) => {
            const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 1; });
            window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
            raf.mockRestore();
        };
        const mountWith = (orientation: string) => {
            (useDesignVariablesHook.useDesignVariables as any).mockReturnValue({
                variables: {},
                attributes: { 'data-sx-shadow-orientation': orientation },
                responsiveCSS: null,
            });
            return render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} />);
        };

        it('com a opção ativa publica --sarak-light-x/y, de -1 a 1, oposta ao ponteiro', () => {
            const view = mountWith('dynamic');

            moveMouse(0, window.innerHeight); // canto inferior esquerdo: luz vem de lá, sombra cai para cima e para a direita
            expect(document.documentElement.style.getPropertyValue('--sarak-light-x')).toBe('1');
            expect(document.documentElement.style.getPropertyValue('--sarak-light-y')).toBe('-1');

            moveMouse(window.innerWidth / 2, window.innerHeight / 2);
            expect(Number(document.documentElement.style.getPropertyValue('--sarak-light-x'))).toBeCloseTo(0);
            expect(Number(document.documentElement.style.getPropertyValue('--sarak-light-y'))).toBeCloseTo(0);
            view.unmount();
        });

        it('com qualquer outra opção NÃO escreve a luz (a variável herda pela árvore toda)', () => {
            const view = mountWith('bottom');

            moveMouse(100, 100);

            expect(document.documentElement.style.getPropertyValue('--mouse-x')).not.toBe('');
            expect(document.documentElement.style.getPropertyValue('--sarak-light-x')).toBe('');
            expect(document.documentElement.style.getPropertyValue('--sarak-light-y')).toBe('');
            view.unmount();
        });
    });

    describe('trocar de tema não deixa o que o anterior escreveu', () => {
        const mockOutput = (variables: Record<string, string>, attributes: Record<string, string>) =>
            (useDesignVariablesHook.useDesignVariables as any).mockReturnValue({ variables, attributes, responsiveCSS: null });

        it('a variável inline e o atributo que o tema novo não escreve saem de html e body', () => {
            mockOutput({ '--sarak-card-radius-tl': '3px', '--sarak-card-border-radius': '20px' }, { 'data-sx-border-type': 'glow' });
            const view = render(<DesignInjector design={{ mode: 'dark', systemName: 'a' }} isDrafting={false} />);
            expect(document.documentElement.style.getPropertyValue('--sarak-card-radius-tl')).toBe('3px');
            expect(document.body.getAttribute('data-sx-border-type')).toBe('glow');

            // O tema B declara só o mestre — o canto e o atributo deixam de ser escritos.
            mockOutput({ '--sarak-card-border-radius': '10px' }, {});
            view.rerender(<DesignInjector design={{ mode: 'dark', systemName: 'b' }} isDrafting={false} />);

            for (const el of [document.documentElement, document.body]) {
                expect(el.style.getPropertyValue('--sarak-card-radius-tl'), 'o canto do tema A sai').toBe('');
                expect(el.style.getPropertyValue('--sarak-card-border-radius'), 'o que o B escreve é gravado').toBe('10px');
            }
            expect(document.body.hasAttribute('data-sx-border-type')).toBe(false);
            expect(document.documentElement.hasAttribute('data-sx-border-type')).toBe(false);
        });

        it('CONTRAPROVA: variável que o host escreveu por fora não é do injetor e fica', () => {
            document.documentElement.style.setProperty('--do-host', '1');
            mockOutput({ '--sarak-a': '1' }, {});
            const view = render(<DesignInjector design={{ mode: 'dark', systemName: 'a' }} isDrafting={false} />);
            mockOutput({ '--sarak-b': '2' }, {});
            view.rerender(<DesignInjector design={{ mode: 'dark', systemName: 'b' }} isDrafting={false} />);

            expect(document.documentElement.style.getPropertyValue('--sarak-a')).toBe('');
            expect(document.documentElement.style.getPropertyValue('--do-host')).toBe('1');
        });

        it('no Modo Embarcado a limpeza vale para o container da ilha, e o body do host segue intocado', () => {
            const island = document.createElement('div');
            document.body.appendChild(island);
            mockOutput({ '--sarak-card-radius-tl': '3px' }, {});
            const view = render(<DesignInjector design={{ mode: 'dark', systemName: 'a' }} isDrafting={false} mode="embedded" scopeElement={island} />);
            expect(island.style.getPropertyValue('--sarak-card-radius-tl')).toBe('3px');

            mockOutput({}, {});
            view.rerender(<DesignInjector design={{ mode: 'dark', systemName: 'b' }} isDrafting={false} mode="embedded" scopeElement={island} />);

            expect(island.style.getPropertyValue('--sarak-card-radius-tl')).toBe('');
            island.remove();
        });
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

    it('ao desmontar devolve ao host o que injetou: variáveis, atributos, classe de modo, mídia e a tag responsiva', () => {
        (useDesignVariablesHook.useDesignVariables as any).mockReturnValue({
            variables: { '--test-var': '10px' },
            attributes: { 'data-test': 'active' },
            responsiveCSS: '@media (max-width: 768px) { :root { --test-var: 5px; } }'
        });
        document.body.style.setProperty('--do-host', 'x');

        const { unmount } = render(<DesignInjector design={{ mode: 'dark', globalBackgroundImageUrl: 'url(test.jpg)' }} isDrafting={false} />);
        expect(document.documentElement.style.getPropertyValue('--test-var')).toBe('10px');
        expect(document.getElementById('sarak-responsive-vars')).not.toBeNull();

        unmount();

        expect(document.documentElement.style.getPropertyValue('--test-var')).toBe('');
        expect(document.body.style.getPropertyValue('--test-var')).toBe('');
        expect(document.body.hasAttribute('data-test')).toBe(false);
        expect(document.body.classList.contains('dark')).toBe(false);
        expect(document.body.hasAttribute('data-sarak-has-media')).toBe(false);
        expect(document.getElementById('sarak-responsive-vars')).toBeNull();
        expect(document.body.style.fontFamily).toBe('');
        // CONTRAPROVA: o que o host gravou por fora não é tocado.
        expect(document.body.style.getPropertyValue('--do-host')).toBe('x');
    });
});
