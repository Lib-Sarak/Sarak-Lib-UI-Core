import React from 'react';
import { SarakShellNav, type ShellNavItem } from '../atomic/Navigation/SarakShellNav';
import { useNavigationStyle } from '../../core/Provider/useNavigationStyle';
import { useSarakDevice } from '../../core/Provider/DeviceProvider';
import { SarakAppChromeMobile } from './SarakAppChromeMobile';

/**
 * Item de navegação estruturado do `SarakAppChrome` (Spec 40.2 — L1).
 *
 * Modelo de NAVEGAÇÃO com ícone first-class, pensado para o consumidor de apps
 * separados (conector-redirect): cada item aponta para uma `href` (URL de destino)
 * e o próprio consumidor marca qual está `active`. É o contrato que o `@erp/ui-kit`
 * compartilha entre todos os apps para o cromo ficar IDÊNTICO em toda aba.
 *
 * O `icon` é resolvido pelo `SarakIcon`/`IconMap` curado (mesmo motor do shell),
 * temável por token, opcional por item. Difere do `ShellNavItem` (que usa
 * `route`/`activeRoute` do modelo declarativo) por trazer `id` estável + `active`
 * por item — mais ergonômico para um menu de topo estático por app.
 */
export interface SarakNavItem {
    /** Identidade estável do item (chave de render; não precisa ser a URL). */
    id: string;
    /** Rótulo exibido ao lado do ícone. */
    label: string;
    /** Nome do ícone (resolvido pelo `SarakIcon`/`IconMap` curado). Opcional. */
    icon?: string;
    /** URL de destino — o host navega para cá (redirect de página, router, etc.). */
    href: string;
    /** Marca o item como ativo (destaque + `aria-current="page"`). */
    active?: boolean;
}

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
    /** Conteúdo à direita da topbar (ações, avatar, seletor de tema…). */
    topbarActions?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const Brand: React.FC<{ brand?: { name?: string; logoUrl?: string }; horizontal?: boolean }> = ({ brand, horizontal }) => {
    if (!brand?.name && !brand?.logoUrl) return null;
    return (
        <div className={`flex items-center gap-2 min-w-0 ${horizontal ? '' : 'px-2 py-3'}`}>
            {brand.logoUrl && <img src={brand.logoUrl} alt="" className="h-6 w-6 object-contain shrink-0" />}
            {brand.name && (
                <span
                    className="truncate font-bold tracking-tight"
                    style={{ fontFamily: 'var(--font-heading, var(--font-main, inherit))', color: 'var(--sarak-topbar-title-color, var(--color-theme-title, inherit))' }}
                >
                    {brand.name}
                </span>
            )}
        </div>
    );
};

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
        <main className="flex-1 min-w-0 min-h-0 overflow-auto" style={{ color: 'var(--text-main, var(--color-theme-title, inherit))' }}>
            {children}
        </main>
    );

    if (mode === 'mobile') {
        return (
            <SarakAppChromeMobile
                brand={<Brand brand={brand} horizontal />}
                nav={effectiveNav}
                activeRoute={effectiveActiveRoute}
                onNavigate={onNavigate}
                topbarActions={topbarActions}
                className={className}
                rootStyle={rootStyle}
            >
                {children}
            </SarakAppChromeMobile>
        );
    }

    if (mode === 'topbar') {
        return (
            <div className={`flex flex-col w-full h-full min-h-0 ${className}`} style={rootStyle}>
                <header
                    className="flex items-center gap-4 px-4 shrink-0 border-b"
                    style={{
                        height: 'var(--sarak-topbar-height, 64px)',
                        background: 'var(--sarak-topbar-bg, var(--theme-sidebar-bg, transparent))',
                        borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                    }}
                >
                    <Brand brand={brand} horizontal />
                    {effectiveNav.length > 0 && (
                        <SarakShellNav items={effectiveNav} activeRoute={effectiveActiveRoute} onNavigate={onNavigate} orientation="horizontal" className="flex-1 min-w-0" />
                    )}
                    {topbarActions && <div className="flex items-center gap-2 shrink-0">{topbarActions}</div>}
                </header>
                {contentArea}
            </div>
        );
    }

    return (
        <div className={`flex w-full h-full min-h-0 ${className}`} style={rootStyle}>
            <aside
                className="flex flex-col shrink-0 border-r overflow-y-auto"
                style={{
                    width: 'var(--sarak-sidebar-width, 240px)',
                    background: 'var(--sarak-sidebar-bg, var(--theme-sidebar-bg, transparent))',
                    borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                }}
            >
                <Brand brand={brand} />
                {effectiveNav.length > 0 && (
                    <SarakShellNav items={effectiveNav} activeRoute={effectiveActiveRoute} onNavigate={onNavigate} orientation="vertical" className="flex-1" />
                )}
                {topbarActions && <div className="mt-auto p-2">{topbarActions}</div>}
            </aside>
            {contentArea}
        </div>
    );
};

export default SarakAppChrome;
