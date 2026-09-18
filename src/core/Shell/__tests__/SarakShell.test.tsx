import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { GlobalSchema } from '../../Design/schema/global';
import * as ComponentModule from '../SarakShell';
import { SarakShell } from '../SarakShell';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import { registerSarakModule, registerLocalComponent } from '../../Discovery/registry';
import type { ThemeEntry } from '../../Provider/types';

// Achado da Spec 43 (§5.1), CORRIGIDO na Spec 44: `customThemes` tinha default
// `= []` em `SarakUIProvider` (um NOVO array a cada render sem prop explícita) e
// `useDesignSync` chamava `setDesign` sem guard sempre que `activeThemeId` estava
// setado — a combinação gerava um loop de render infinito real (CPU ~100%, processo
// que nunca terminava). A correção definitiva foi um guard de `activeThemeId` já
// aplicado em `useDesignSync` (não depende mais da referência de `customThemes`
// ser estável) — ver `useDesignSync.test.ts` para a regressão isolada. Esta
// constante segue em uso aqui só por ser a prática recomendada, não workaround.
const STABLE_EMPTY_CUSTOM_THEMES: ThemeEntry[] = [];

// As animações spring/exit do framer-motion (usadas no `AnimatePresence` do
// `ShellContent`) nunca convergem em jsdom (sem timing real de paint/rAF) e travam
// o teste indefinidamente — mesmo padrão já usado em `SidebarNav.test.tsx`/
// `DockNav.test.tsx`: substitui por passthroughs estáticos, sem animação.
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...(actual as object),
        motion: { div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div> },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

// jsdom não implementa ResizeObserver (usado por useDimensionGuard para medir a
// área de conteúdo do shell). Um stub que nunca invoca o callback força o shell a
// só ficar pronto pelo fallback de 3s (`useDimensionGuard`), e revelou um loop de
// reset real (isReady flipando junto com o módulo ativo) — o stub aqui reporta uma
// dimensão estável de imediato, como um ResizeObserver real faria no primeiro layout.
class ResizeObserverStub {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
    }
    observe(target: Element) {
        this.cb(
            [{ target, contentRect: { width: 1024, height: 768 } } as unknown as ResizeObserverEntry],
            this as unknown as ResizeObserver,
        );
    }
    unobserve() {}
    disconnect() {}
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;

// `SarakUIProvider` tenta carregar o design remoto (`fetch('/api/ui/design')`) por
// padrão — em jsdom isso resolve para `http://localhost/api/ui/design` e, se algo
// nesta máquina responder nessa porta sem nunca fechar a conexão, o fetch real
// nunca resolve/rejeita e o processo do teste fica pendurado (idle, aguardando
// socket). Este teste não tem nem precisa de backend (persistência default é
// localStorage) — desliga a rede por completo.
vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network disabled in test'))));

describe('SarakShell', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });
});

/**
 * plan-08 F3 (achado 9) — o shell testava `navigationStyle === 'glass'`, valor que o schema
 * nunca ofereceu. O ramo era inalcançável só porque `validateDesign` descartava o valor:
 * protegido por acidente, não por desenho. Se alguém acrescentasse `'glass'` ao schema,
 * `isSidebar` viraria `false` e a tela ficaria SEM NAVEGAÇÃO NENHUMA.
 *
 * Este teste cobra a paridade nos dois sentidos, então vale para qualquer valor futuro —
 * não é um teste sobre a palavra "glass".
 */
describe('navigationStyle: o shell e o schema falam do mesmo conjunto (F3)', () => {
    const fonte = fs.readFileSync(path.join(process.cwd(), 'src/core/Shell/SarakShell.tsx'), 'utf-8');
    const comparados = [...fonte.matchAll(/navigationStyle\s*===\s*'([^']+)'/g)].map((m) => m[1]);
    const doSchema = (GlobalSchema.tokens
        .find((t) => t.id === 'navigationStyle')?.constraints?.options ?? [])
        .map((o) => String(o.value));

    it('o schema segue oferecendo sidebar | topbar | dock', () => {
        expect(doSchema).toEqual(['sidebar', 'topbar', 'dock']);
    });

    it('todo valor comparado no shell existe no schema — zero ramo inalcançável', () => {
        expect(comparados.length).toBeGreaterThan(0);
        expect(comparados.filter((v) => !doSchema.includes(v))).toEqual([]);
    });

    it('a sidebar é o fallback de qualquer valor fora de topbar/dock — nunca fica sem nav', () => {
        const expressaoFallback = /isSidebar\s*=\s*design\?\.navigationStyle === 'sidebar'\s*\|\|\s*\(!isTopbar && !isDock\)/;
        expect(fonte).toMatch(expressaoFallback);
    });
});

/**
 * Spec 43 — modelo de consumo oficial (módulos-plugin, padrão Sarak-MyService):
 * o importador registra um módulo de negócio (React) na base e monta
 * `SarakUIProvider` + `SarakShell`, sem passar por manifesto/JSON nenhum.
 */
describe('Modelo módulos-plugin sob SarakUIProvider + SarakShell (Spec 43)', () => {
    const MODULE_ID = 'spec43-modulo-negocio';

    const clearRegistry = () => {
        const globalRegistry = window as unknown as {
            __SARAK_REGISTRY_MODS__?: Map<string, unknown>;
            __SARAK_REGISTRY_COMPS__?: Map<string, unknown>;
            __SARAK_REGISTRY_LISTENERS__?: Set<() => void>;
        };
        globalRegistry.__SARAK_REGISTRY_MODS__?.clear();
        globalRegistry.__SARAK_REGISTRY_COMPS__?.clear();
        globalRegistry.__SARAK_REGISTRY_LISTENERS__?.clear();
    };

    beforeEach(() => {
        clearRegistry();
        localStorage.clear();
        // `useRegistryManager` sempre registra `mx-customization` (Design Engine)
        // com prioridade 9999 — sem uma URL ativa, o auto-navigate do
        // `useSarakShell` prioriza ESSE módulo sobre qualquer outro. Navegar direto
        // para a rota do módulo de teste evita depender do módulo embutido.
        window.history.replaceState(null, '', `/${MODULE_ID}`);
    });

    // Componente de negócio do IMPORTADOR (não é um átomo Sarak): a única forma
    // de responder à central de tema é usar o contrato de tokens públicos
    // (Spec 43 §3.3) — aqui, `var(--sarak-primary-color)`.
    const CustomBusinessModule: React.FC = () => (
        <div
            data-testid="modulo-plugin-tematizado"
            style={{ color: 'var(--sarak-primary-color)' }}
        >
            Módulo de negócio do importador
        </div>
    );

    it('registra um módulo/componente e o renderiza no SarakShell sob o SarakUIProvider', async () => {
        registerLocalComponent(MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: MODULE_ID, label: 'Módulo de Teste', icon: 'Box' });

        render(
            <SarakUIProvider options={{ persistence: { storageKey: 'spec43-test-a' } }}>
                <SarakShell />
            </SarakUIProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });
    });

    it('é tematizado pela central: trocar o tema ativo muda o token que o módulo do importador consome', async () => {
        registerLocalComponent(MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: MODULE_ID, label: 'Módulo de Teste', icon: 'Box' });

        const { unmount } = render(
            <SarakUIProvider
                options={{ persistence: { storageKey: 'spec43-test-b' } }}
                activeThemeId="cyberpunk-neon"
                customThemes={STABLE_EMPTY_CUSTOM_THEMES}
            >
                <SarakShell />
            </SarakUIProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });

        const primaryColorThemeA = document.documentElement.style.getPropertyValue('--sarak-primary-color');
        expect(primaryColorThemeA).toBeTruthy();

        unmount();
        clearRegistry();
        window.history.replaceState(null, '', `/${MODULE_ID}`);

        registerLocalComponent(MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: MODULE_ID, label: 'Módulo de Teste', icon: 'Box' });

        render(
            <SarakUIProvider
                options={{ persistence: { storageKey: 'spec43-test-c' } }}
                activeThemeId="nature-breeze"
                customThemes={STABLE_EMPTY_CUSTOM_THEMES}
            >
                <SarakShell />
            </SarakUIProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });

        const primaryColorThemeB = document.documentElement.style.getPropertyValue('--sarak-primary-color');
        expect(primaryColorThemeB).toBeTruthy();

        // A central (Design Engine) reescreve o MESMO token público a cada troca de
        // tema — é essa reescrita que faz "trocar um tema atingir todas as telas"
        // valer também para o código do importador (Spec 43 §2.2/§3.3), sem que o
        // módulo de negócio precise de nenhum CSS próprio.
        expect(primaryColorThemeB).not.toBe(primaryColorThemeA);
    });

    it('não entra em loop de render infinito com `activeThemeId` setado e `customThemes` INSTÁVEL (regressão real da Spec 43 §5.1, corrigida na Spec 44)', async () => {
        registerLocalComponent(MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: MODULE_ID, label: 'Módulo de Teste', icon: 'Box' });

        // O footgun exato do achado: uma prop `customThemes` com uma referência
        // NOVA a cada render (aqui, via um wrapper que força re-render do pai).
        // Antes da correção em `useDesignSync`, isto nunca convergia (CPU ~100%).
        let renderCount = 0;
        const UnstableWrapper: React.FC = () => {
            renderCount += 1;
            return (
                <SarakUIProvider
                    options={{ persistence: { storageKey: 'spec44-loop-regression' } }}
                    activeThemeId="cyberpunk-neon"
                    customThemes={[]}
                >
                    <SarakShell />
                </SarakUIProvider>
            );
        };

        render(<UnstableWrapper />);

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });

        // Sem o guard, este teste nunca chegaria aqui (o processo travaria antes).
        // Chegar até este ponto já prova a ausência do loop; a asserção abaixo é
        // só uma segunda confirmação de que o tema efetivamente aplicou.
        expect(document.documentElement.style.getPropertyValue('--sarak-primary-color')).toBeTruthy();
        expect(renderCount).toBeGreaterThan(0);
    });

    // Spec 05 §5.2 — paridade com o cromo apresentacional: a SidebarNav do Shell
    // não estava condicionada a `isNavVisible`, então o sensor de borda aparecia
    // mas a sidebar nunca saía do lugar.
    it('auto-hide: a sidebar some ao sair do hover e volta pelo sensor de borda', async () => {
        registerLocalComponent(MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: MODULE_ID, label: 'Módulo de Teste', icon: 'Box' });

        const { container } = render(
            <SarakUIProvider
                config={{ isAutoHideEnabled: true }}
                options={{ persistence: { storageKey: 'plan78-autohide' } }}
                customThemes={STABLE_EMPTY_CUSTOM_THEMES}
            >
                <SarakShell />
            </SarakUIProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });

        // `isNavVisible` nasce `true` (useSarakShellUI) — mesma referência de
        // comportamento do DockNav: visível de início, some ao sair do hover.
        expect(container.querySelector('aside')).not.toBeNull();

        const aside = container.querySelector('aside')!;
        fireEvent.mouseLeave(aside);

        await waitFor(() => {
            expect(container.querySelector('aside')).toBeNull();
        });
        expect(container.querySelector('.fixed.left-0.top-0')).not.toBeNull();

        fireEvent.mouseEnter(container.querySelector('.fixed.left-0.top-0')!);
        await waitFor(() => {
            expect(container.querySelector('aside')).not.toBeNull();
        });
    });

    it('sem auto-hide, a sidebar continua sempre visível — comportamento de hoje', async () => {
        registerLocalComponent(MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: MODULE_ID, label: 'Módulo de Teste', icon: 'Box' });

        const { container } = render(
            <SarakUIProvider
                options={{ persistence: { storageKey: 'plan78-sem-autohide' } }}
                customThemes={STABLE_EMPTY_CUSTOM_THEMES}
            >
                <SarakShell />
            </SarakUIProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });

        const aside = container.querySelector('aside')!;
        fireEvent.mouseLeave(aside);
        expect(container.querySelector('aside')).not.toBeNull();
    });

    // Spec 05 §5.2 — sem `onSelect`, o SarakSearch listava os módulos e
    // nenhum resultado navegava.
    it('a busca do Shell ativa o módulo escolhido e fecha o palette', async () => {
        const OTHER_ID = 'plan78-search-outro-modulo';
        registerLocalComponent(MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: MODULE_ID, label: 'Módulo de Teste', icon: 'Box' });
        registerLocalComponent(OTHER_ID, () => <div data-testid="outro-modulo">Outro módulo</div>);
        registerSarakModule({ id: OTHER_ID, label: 'Outro Módulo', icon: 'Box' });

        const { container } = render(
            <SarakUIProvider
                options={{ persistence: { storageKey: 'plan78-search-select' } }}
                customThemes={STABLE_EMPTY_CUSTOM_THEMES}
            >
                <SarakShell />
            </SarakUIProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        // "Outro Módulo" também existe como item da SidebarNav — escopar a busca
        // ao overlay do palette (`z-[600]`) para pegar SÓ o resultado da busca.
        const overlay = await waitFor(() => container.querySelector('[class*="z-[600]"]') as HTMLElement);
        const resultado = within(overlay).getByText('Outro Módulo');
        fireEvent.click(resultado.closest('button')!);

        await waitFor(() => {
            expect(screen.getByTestId('outro-modulo')).toBeInTheDocument();
        });
        expect(screen.queryByPlaceholderText('Buscar ferramenta, registro ou configuração…')).not.toBeInTheDocument();
    });

    // os textos da própria lib seguem o idioma que vale (specs/10 §3.6).
    it('a busca do Shell sai em português por padrão, e em inglês com `config.language: "en"`', async () => {
        registerLocalComponent(MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: MODULE_ID, label: 'Módulo de Teste', icon: 'Box' });

        render(
            <SarakUIProvider
                options={{ persistence: { storageKey: 'plan79-idioma-pt' } }}
                customThemes={STABLE_EMPTY_CUSTOM_THEMES}
            >
                <SarakShell />
            </SarakUIProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        expect(await screen.findByPlaceholderText('Buscar ferramenta, registro ou configuração…')).toBeInTheDocument();
    });

    it('a busca do Shell sai em inglês com `config.language: "en"`', async () => {
        const EN_MODULE_ID = 'plan79-idioma-en';
        registerLocalComponent(EN_MODULE_ID, CustomBusinessModule);
        registerSarakModule({ id: EN_MODULE_ID, label: 'English Test Module', icon: 'Box' });
        window.history.replaceState(null, '', `/${EN_MODULE_ID}`);

        render(
            <SarakUIProvider
                config={{ language: 'en' }}
                options={{ persistence: { storageKey: 'plan79-idioma-en' } }}
                customThemes={STABLE_EMPTY_CUSTOM_THEMES}
            >
                <SarakShell />
            </SarakUIProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('modulo-plugin-tematizado')).toBeInTheDocument();
        });

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        expect(await screen.findByPlaceholderText('Search tool, record or configuration…')).toBeInTheDocument();
    });
});
