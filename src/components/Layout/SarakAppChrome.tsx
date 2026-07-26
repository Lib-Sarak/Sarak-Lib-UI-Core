import React from 'react';
import { SarakShellNav, type ShellNavItem } from '../atomic/Navigation/SarakShellNav';
import { useNavigationStyle } from '../../core/Provider/useNavigationStyle';
import { useSarakDevice } from '../../core/Provider/DeviceProvider';
import { SarakAppChromeMobile } from './SarakAppChromeMobile';
import { ChromeFrame } from './chrome/ChromeFrame';
import { ChromeBrand, ChromeSidebarSlot, ChromeTopbarSlot } from './chrome/ChromeSlots';
import type { SarakNavItem } from './chrome/navItem';

/** Contrato de navegação estruturada com ícone first-class (Spec 40.2 — L1). */
export type { SarakNavItem } from './chrome/navItem';

/**
 * SarakAppChrome — cromo apresentacional temável (topbar/sidebar) SEM host/registro.
 *
 * A lacuna real do Teste Real (Spec 40.1 — L2): os tokens de cromo da Spec 18
 * (`--sarak-topbar-*`, `--sarak-sidebar-*`) ficavam SEM consumidor porque o único
 * consumidor era o `SarakShell`, que é um HOST de módulos-plugin (renderiza o
 * `activeModule` do Discovery, não `children`). Um consumidor de apps-separados (como
 * o ERP) não usa o modelo Shell/registro — então nada pintava a topbar/sidebar.
 *
 * `SarakAppChrome` fecha isso: é um cromo 100% PRESENTACIONAL — topbar/sidebar + área
 * de conteúdo (`children`) —, temável por tokens do Design Engine, que CADA app
 * renderiza sozinho. Sem `registerSarakModule`, sem Discovery, sem acoplar módulos.
 * A navegação é DADO (`navItems`/`nav`) e a seleção sai por callback (`onNavigate`) —
 * o host decide o que fazer (redirect de página inteira, router local, etc.).
 *
 * Multidispositivo por padrão (Spec 40.3 — L1), zero-config via `useSarakDevice`: em
 * **desktop** é o cromo configurado (sidebar/topbar); em **tablet** vira topbar compacta
 * (a sidebar cheia comeria a tela ≤1024px); no **celular** colapsa para barra + hambúrguer
 * + drawer (`SarakAppChromeMobile`) — a nav não ocupa a tela toda e continua acessível. O
 * consumidor não escreve CSS/media query; para refinar, os tokens de cromo aceitam
 * `ResponsiveValue` pelo Design Engine.
 *
 * Extensibilidade de layout (Spec 48 — L1): os slots `logo`/`topbarStart`/`topbarEnd`/
 * `sidebarHeader`/`sidebarFooter`/`banner`/`footer`/`decoration` deixam o consumidor
 * injetar imagem, animação ou qualquer `ReactNode` em regiões do cromo sem forkar a
 * componente. Todos opcionais (ausente = região não renderiza); complementam — não
 * substituem — o fundo/atmosfera GLOBAL por tema do Design Engine.
 *
 * Zero hardcode (Regra 2): toda cor/medida vem de tokens `--sarak-*` com fallback.
 */
export interface SarakAppChromeProps {
    /** Conteúdo do app (a tela do próprio módulo). */
    children: React.ReactNode;
    /** Identidade exibida no cromo (topo da sidebar / início da topbar). */
    brand?: { name?: string; logoUrl?: string };
    /**
     * Navegação ESTRUTURADA com ícone first-class (Spec 40.2 — L1). Renderiza
     * ícone (via `SarakIcon`/`IconMap`) + label, temável por token, com estado
     * ativo acessível (`aria-current`, foco por teclado). É o caminho recomendado
     * para o cromo por-app; tem precedência sobre `nav` quando ambos são passados.
     */
    navItems?: SarakNavItem[];
    /**
     * Itens de navegação como DADO no contrato do `SarakShellNav` (modelo declarativo,
     * `route`/`activeRoute`). Mantido para compatibilidade; prefira `navItems`.
     */
    nav?: ShellNavItem[];
    /** Rota ativa (destaca o item correspondente no `nav`; ignorado se `navItems`). */
    activeRoute?: string;
    /** Clique/teclado num item de navegação — o host decide como navegar. */
    onNavigate?: (route: string) => void;
    /**
     * Estilo do cromo. `'auto'` (default) segue o Design Engine
     * (`design.navigationStyle === 'topbar'` → topbar; caso contrário → sidebar),
     * então trocar o tema no `/design` também troca a orientação do cromo.
     */
    navigationStyle?: 'sidebar' | 'topbar' | 'auto';
    /** Conteúdo à direita da topbar (ações, avatar, seletor de tema…). Alias legado de `topbarEnd`. */
    topbarActions?: React.ReactNode;
    /**
     * Slot `logo` (Spec 48 — L1): logo custom/animado (`ReactNode`). Tem PRECEDÊNCIA
     * sobre `brand.logoUrl`; o `brand.name` continua ao lado. Aparece nos três modos.
     */
    logo?: React.ReactNode;
    /**
     * Slot `topbarStart`: conteúdo no INÍCIO da barra superior (após a marca).
     * Sem barra superior (modo sidebar) degrada para o topo da sidebar.
     */
    topbarStart?: React.ReactNode;
    /**
     * Slot `topbarEnd`: conteúdo no FIM da barra superior. É o mesmo lugar do
     * `topbarActions` (alias preservado); quando os dois vêm, `topbarEnd` vence.
     * No modo sidebar degrada para o rodapé da sidebar (comportamento atual).
     */
    topbarEnd?: React.ReactNode;
    /** Slot `sidebarHeader`: topo da sidebar (abaixo da marca). No celular migra para o drawer. */
    sidebarHeader?: React.ReactNode;
    /** Slot `sidebarFooter`: rodapé da sidebar. No celular migra para o drawer. */
    sidebarFooter?: React.ReactNode;
    /** Slot `banner`: faixa full-width no topo do cromo (aviso, promo, faixa animada). */
    banner?: React.ReactNode;
    /** Slot `footer`: faixa full-width na base do cromo (rodapé da página). */
    footer?: React.ReactNode;
    /**
     * Slot `decoration`: camada decorativa ATRÁS do conteúdo do cromo (imagem/animação
     * escopada ao cromo). É ornamento — `aria-hidden` e sem captura de foco/toque.
     * COMPLEMENTA o fundo/atmosfera global por tema (Design Engine), não o substitui.
     */
    decoration?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Cromo apresentacional. Renderiza topbar OU sidebar (por `navigationStyle`) + a área
 * de conteúdo, tudo pintado pelos tokens de navegação (Spec 18) que o Design Engine emite.
 */
export const SarakAppChrome: React.FC<SarakAppChromeProps> = ({
    children,
    brand,
    navItems,
    nav = [],
    activeRoute,
    onNavigate,
    navigationStyle = 'auto',
    topbarActions,
    logo,
    topbarStart,
    topbarEnd,
    sidebarHeader,
    sidebarFooter,
    banner,
    footer,
    decoration,
    className = '',
    style,
}) => {
    const designNav = useNavigationStyle();
    const device = useSarakDevice();
    const resolved = navigationStyle === 'auto' ? (designNav === 'topbar' ? 'topbar' : 'sidebar') : navigationStyle;

    // Multidispositivo por padrão (Spec 40.3 — L1), zero-config via `useSarakDevice`:
    //  - desktop: o cromo configurado (sidebar OU topbar por `navigationStyle`);
    //  - tablet:  tier intermediário — topbar compacta (a sidebar cheia comeria a tela ≤1024px);
    //  - celular: colapsa para barra + hambúrguer + drawer (`SarakAppChromeMobile`), a nav não
    //             ocupa a tela toda e fica acessível. O consumidor não escreve CSS/media query.
    const mode: 'sidebar' | 'topbar' | 'mobile' =
        device === 'smartphone' ? 'mobile' : device === 'tablet' ? 'topbar' : resolved;

    // `navItems` (Spec 40.2 — L1) tem precedência: mapeia o modelo estruturado
    // (id/href/active + ícone) para o contrato do `SarakShellNav`, reusando o mesmo
    // renderizador de ícone (`SarakIcon`) + `aria-current` + foco por teclado. A rota
    // ativa vem do item marcado `active`; sem `navItems`, cai no `nav`/`activeRoute`.
    const effectiveNav: ShellNavItem[] = navItems
        ? navItems.map((item) => ({ label: item.label, route: item.href, icon: item.icon }))
        : nav;
    const effectiveActiveRoute = navItems
        ? navItems.find((item) => item.active)?.href ?? activeRoute
        : activeRoute;

    // `topbarActions` é o nome legado do slot `topbarEnd` (Spec 48 — L1): mesmo lugar,
    // mesma semântica. Preservado sem breaking change; `topbarEnd` tem precedência.
    const endSlot = topbarEnd ?? topbarActions;

    // Altura própria do cromo (Spec 40.2 R2 — bug de browser): o cromo é a casca do app,
    // então NÃO pode depender do host setar `html/body/#root { height:100% }`. Sem uma
    // altura definida, o `h-full` colapsa (percentual sobre ancestral indefinido) e a
    // sidebar/topbar somem (a nav tem `overflow` → é recortada) enquanto o `children`
    // (flex-1) ainda aparece — exatamente o sintoma reportado. `100dvh` dá ao cromo uma
    // altura de viewport própria; o `style` do consumidor sobrescreve (uso embarcado).
    const rootStyle: React.CSSProperties = {
        minHeight: '100dvh',
        background: 'var(--bg-body, var(--theme-body, transparent))',
        ...style,
    };

    const contentArea = (
        <main className="relative flex-1 min-w-0 min-h-0 overflow-auto" style={{ color: 'var(--text-main, var(--color-theme-title, inherit))' }}>
            {children}
        </main>
    );

    if (mode === 'mobile') {
        return (
            <SarakAppChromeMobile
                brand={<ChromeBrand brand={brand} logo={logo} horizontal />}
                nav={effectiveNav}
                activeRoute={effectiveActiveRoute}
                onNavigate={onNavigate}
                topbarActions={endSlot}
                topbarStart={topbarStart}
                sidebarHeader={sidebarHeader}
                sidebarFooter={sidebarFooter}
                banner={banner}
                footer={footer}
                decoration={decoration}
                className={className}
                rootStyle={rootStyle}
            >
                {children}
            </SarakAppChromeMobile>
        );
    }

    if (mode === 'topbar') {
        return (
            <ChromeFrame decoration={decoration} banner={banner} footer={footer} className={className} rootStyle={rootStyle}>
                <header
                    className="relative flex items-center gap-4 px-4 shrink-0 border-b"
                    style={{
                        height: 'var(--sarak-topbar-height, 64px)',
                        background: 'var(--sarak-topbar-bg, var(--theme-sidebar-bg, transparent))',
                        borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                    }}
                >
                    <ChromeBrand brand={brand} logo={logo} horizontal />
                    <ChromeTopbarSlot region="start">{topbarStart}</ChromeTopbarSlot>
                    {effectiveNav.length > 0 && (
                        <SarakShellNav items={effectiveNav} activeRoute={effectiveActiveRoute} onNavigate={onNavigate} orientation="horizontal" className="flex-1 min-w-0" />
                    )}
                    <ChromeTopbarSlot region="end" className="ml-auto">{endSlot}</ChromeTopbarSlot>
                </header>
                {contentArea}
            </ChromeFrame>
        );
    }

    return (
        <ChromeFrame decoration={decoration} banner={banner} footer={footer} className={className} rootStyle={rootStyle}>
            <div className="relative flex flex-1 min-w-0 min-h-0">
                <aside
                    className="flex flex-col shrink-0 border-r overflow-y-auto"
                    style={{
                        width: 'var(--sarak-sidebar-width, 240px)',
                        background: 'var(--sarak-sidebar-bg, var(--theme-sidebar-bg, transparent))',
                        borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                    }}
                >
                    <ChromeBrand brand={brand} logo={logo} />
                    {/* Sem barra superior, `topbarStart`/`topbarEnd` degradam para topo/rodapé da sidebar. */}
                    <ChromeTopbarSlot region="start" className="px-2">{topbarStart}</ChromeTopbarSlot>
                    <ChromeSidebarSlot region="header">{sidebarHeader}</ChromeSidebarSlot>
                    {effectiveNav.length > 0 && (
                        <SarakShellNav items={effectiveNav} activeRoute={effectiveActiveRoute} onNavigate={onNavigate} orientation="vertical" className="flex-1" />
                    )}
                    {/* Markup preservado byte a byte do `topbarActions` no modo sidebar (compat). */}
                    {endSlot && <div data-sarak-slot="topbarEnd" className="mt-auto p-2">{endSlot}</div>}
                    <ChromeSidebarSlot region="footer">{sidebarFooter}</ChromeSidebarSlot>
                </aside>
                {contentArea}
            </div>
        </ChromeFrame>
    );
};

export default SarakAppChrome;
