/**
 * Modo Embarcado (Spec 24) — gate de NÃO-VAZAMENTO no nível do DOM.
 *
 * O Modo Embarcado renderiza uma ILHA sobre um frontend que já existe. Este arquivo
 * cobre os 5 vazamentos tabelados na spec (+ o sequestro do SovereignThemeInjector,
 * achado na execução) do lado do DOM, e confirma que o Modo App (default) continua
 * fazendo exatamente o que sempre fez.
 *
 * O que jsdom NÃO cobre: `getComputedStyle` não resolve `var()` nem cascata real de
 * stylesheet. A prova de que o CSS escopado não repinta o host é o gate E2E
 * (`__e2e__/EmbeddedNoLeak.spec.tsx`, Chromium) + o gate estático do transformador
 * (`scopeCss.test.ts`).
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';
import { SARAK_SCOPE_CLASS } from '../scope';
import { useToast } from '../../../components/atomic/Feedback/SarakToast';

const DESIGN = { systemName: 'Sistema Sarak', mode: 'light' as const, primaryColor: '#ff0000' };
const HOST_TITLE = 'App do Host — intocado';

const ToastProbe: React.FC = () => {
    const toast = useToast();
    return (
        <button type="button" onClick={() => toast.notify({ message: 'toast-embarcado' })}>
            disparar-toast
        </button>
    );
};

const scopeRoot = (): HTMLElement | null => document.querySelector(`[data-sarak-scope-root="true"]`);

beforeEach(() => {
    document.title = HOST_TITLE;
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');
    document.body.className = '';
});

describe('Modo Embarcado — o Provider não toca em nada fora da ilha', () => {
    const renderEmbedded = (children: React.ReactNode = <div>ilha</div>) =>
        render(
            <SarakUIProvider config={DESIGN} options={{ mode: 'embedded' }}>
                {children}
            </SarakUIProvider>,
        );

    it('materializa o container `.sarak-scope` envolvendo os filhos', () => {
        renderEmbedded(<div data-testid="conteudo">ilha</div>);
        const root = scopeRoot();
        expect(root).not.toBeNull();
        expect(root).toHaveClass(SARAK_SCOPE_CLASS);
        expect(root).toContainElement(screen.getByTestId('conteudo'));
    });

    it('vazamento #2: NÃO sobrescreve o `document.title` do host', () => {
        renderEmbedded();
        expect(document.title).toBe(HOST_TITLE);
    });

    it('vazamento #3: escreve as design tokens no container, não no `:root`/`body`', () => {
        renderEmbedded();
        const root = scopeRoot();
        expect(root?.getAttribute('style')).toContain('--');
        expect(document.documentElement.getAttribute('style') ?? '').not.toContain('--sarak');
        expect(document.body.getAttribute('style') ?? '').not.toContain('--sarak');
    });

    it('vazamento #3: aplica a classe de modo (light/dark) no container, não no `body`', () => {
        renderEmbedded();
        expect(scopeRoot()).toHaveClass('light');
        expect(document.body.classList.contains('light')).toBe(false);
    });

    it('vazamento #4: não monta NoiseOverlay nem o fundo global fixo sobre o host', () => {
        const { container } = renderEmbedded();
        expect(container.querySelector('.z-\\[9999\\]')).toBeNull();
        const fixedFullScreen = Array.from(container.querySelectorAll('div')).filter((el) =>
            el.className.includes?.('fixed') && el.className.includes?.('inset-0'),
        );
        expect(fixedFullScreen).toHaveLength(0);
    });

    it('vazamento #5: não injeta as fontes globais no `<head>` sem opt-in', () => {
        renderEmbedded();
        expect(document.getElementById('sarak-core-fonts')).toBeNull();
    });

    it('vazamento #5: injeta as fontes quando o consumidor pede explicitamente', () => {
        render(
            <SarakUIProvider
                config={DESIGN}
                options={{ mode: 'embedded', embedded: { injectGlobalFonts: true } }}
            >
                <div>ilha</div>
            </SarakUIProvider>,
        );
        expect(document.getElementById('sarak-core-fonts')).not.toBeNull();
    });

    it('não deixa o `<style>` de vars responsivas no `<head>` do host', () => {
        renderEmbedded();
        expect(document.getElementById('sarak-responsive-vars')).toBeNull();
    });

    it('o CSS emitido pela ilha é ancorado em `.sarak-scope` (nunca alcança o host)', () => {
        const { container } = renderEmbedded();
        const styles = Array.from(container.querySelectorAll('style'));
        expect(styles.length).toBeGreaterThan(0);
        styles.forEach((tag) => {
            const css = tag.innerHTML;
            expect(css).toContain(`.${SARAK_SCOPE_CLASS}`);
            // O sequestro do SovereignThemeInjector não pode ancorar no `body` do host.
            expect(css).not.toMatch(/(^|[^-\w])body\s*\./);
        });
    });

    it('o portal do toast carrega a classe de escopo (senão renderiza sem estilo)', async () => {
        render(
            <SarakUIProvider config={DESIGN} options={{ mode: 'embedded' }}>
                <ToastProbe />
            </SarakUIProvider>,
        );
        await act(async () => {
            fireEvent.click(screen.getByText('disparar-toast'));
        });
        const toast = await screen.findByText('toast-embarcado');
        expect(toast.closest(`[data-sarak-portal-scope="true"]`)).not.toBeNull();
        expect(toast.closest(`.${SARAK_SCOPE_CLASS}`)).not.toBeNull();
    });

    it('N árvores React sob 1 Provider embarcado: estado independente, 1 só escopo', () => {
        // Cada ilha carrega SEU PRÓPRIO estado local (React puro, sem DataStore
        // compartilhado do antigo motor de manifesto — Spec 46) para provar que não
        // há vazamento de estado entre árvores irmãs sob o mesmo escopo embarcado.
        const Ilha: React.FC<{ inicial: string }> = ({ inicial }) => {
            const [valor] = useState(inicial);
            return <span>{valor}</span>;
        };

        render(
            <SarakUIProvider config={DESIGN} options={{ mode: 'embedded' }}>
                <Ilha inicial="dados-da-ilha-A" />
                <Ilha inicial="dados-da-ilha-B" />
            </SarakUIProvider>,
        );

        // Cada ilha mantém o SEU estado — sem interferência.
        const ilhaA = screen.getByText('dados-da-ilha-A');
        const ilhaB = screen.getByText('dados-da-ilha-B');

        // Um único container de escopo envolve as duas ilhas (o padrão suportado).
        const escopo = scopeRoot();
        expect(document.querySelectorAll(`[data-sarak-scope-root="true"]`)).toHaveLength(1);
        expect(escopo).toContainElement(ilhaA);
        expect(escopo).toContainElement(ilhaB);
    });
});

describe('Modo App (default) — comportamento inalterado', () => {
    const renderApp = (options = {}) =>
        render(
            <SarakUIProvider config={DESIGN} options={options}>
                <div data-testid="conteudo">app</div>
            </SarakUIProvider>,
        );

    it('não cria container de escopo nem envelope de portal', () => {
        renderApp();
        expect(scopeRoot()).toBeNull();
        expect(document.querySelector(`[data-sarak-portal-scope="true"]`)).toBeNull();
    });

    it('continua dono da página: título, vars no `:root` e classe de modo no `body`', () => {
        renderApp();
        // O valor exato é o `systemName` RESOLVIDO pela engine (config + defaults +
        // branding); o que este gate afirma é que o Modo App continua dono do título.
        expect(document.title).not.toBe(HOST_TITLE);
        expect(document.documentElement.getAttribute('style') ?? '').toContain('--');
        expect(document.body.classList.contains('light')).toBe(true);
    });

    it('`mode: "app"` explícito é idêntico ao default', () => {
        renderApp({ mode: 'app' });
        expect(scopeRoot()).toBeNull();
        expect(document.title).not.toBe(HOST_TITLE);
    });
});
