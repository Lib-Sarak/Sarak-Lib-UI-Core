import React, { useRef } from 'react';
import { useNavigationAppearance } from '../../../core/Provider/useNavigationAppearance';
import { BRAND_NAME_LINE_HEIGHT, useFitBrandName } from './useFitBrandName';

/**
 * Regiões de slot do cromo (Spec 48 — L1).
 *
 * A lib dá a REGIÃO, o consumidor dá o CONTEÚDO: cada bloco aqui é um invólucro
 * mínimo (`ReactNode` puro dentro), sem presumir o que vai lá — imagem, vídeo,
 * animação, faixa promocional. **Ausente = não renderiza a região** (cada bloco
 * devolve `null` sem `children`), então nenhum slot cria espaço morto.
 *
 * Cada região carrega `data-sarak-slot="<nome>"` — âncora estável para teste e
 * para o consumidor mirar por CSS sem depender de estrutura interna.
 *
 * Zero hardcode (Regra 2): onde há medida, ela vem de token `--sarak-*` com fallback.
 */

/**
 * Monograma da marca sem logo: a inicial do nome, no raio do tema, na cor do texto da marca sobre o fundo da marca, com um aro do
 * texto. Na faixa a cor do fundo é a dela, e o aro é o que desenha a caixa; recolhida, o monograma carrega o fundo da marca sozinho,
 * e o texto dele foi escolhido contra esse fundo, não contra a barra.
 */
const ChromeBrandMonogram: React.FC<{ name: string }> = ({ name }) => (
    <span
        aria-hidden="true"
        data-sarak-brand-monogram="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-xs font-black"
        style={{
            borderRadius: 'var(--sarak-border-radius, 12px)',
            background: 'var(--sarak-sidebar-brand-bg, transparent)',
            boxShadow: 'inset 0 0 0 var(--sarak-border-width, 1px) color-mix(in srgb, var(--sarak-sidebar-brand-color, var(--sarak-on-sidebar, #f2f6fb)) 40%, transparent)',
            color: 'var(--sarak-sidebar-brand-color, var(--sarak-on-sidebar, #f2f6fb))',
        }}
    >
        {name.trim().charAt(0).toUpperCase()}
    </span>
);

/**
 * O nome da marca: quebra entre palavras em até duas linhas e encolhe até caber, nunca com reticências. Sobre o fundo da marca
 * (a faixa, ou o bloco com logo) ele leva o texto da marca, escolhido contra esse fundo; sem fundo, está sobre a barra e leva o
 * texto forte dela.
 * `sidebarLabelMaxWidth`/`topbarLabelMaxWidth` (Spec 05 §2.4) são a largura em que o nome passa para a linha de baixo.
 */
const ChromeBrandName: React.FC<{ name: string; horizontal?: boolean; onBrandFill: boolean }> = ({ name, horizontal, onBrandFill }) => {
    const ref = useRef<HTMLSpanElement>(null);
    useFitBrandName(ref, name);
    const maxWidth = horizontal ? 'var(--sarak-topbar-label-max-width, 150px)' : 'var(--sarak-sidebar-label-max-width, 120px)';
    return (
        <span
            ref={ref}
            data-sarak-brand-name="true"
            style={{
                // Tipografia do nome da marca: `identityFontFamily`/`identityFontWeight`/`identityTracking`.
                fontFamily: 'var(--sarak-identity-font, var(--font-heading, var(--font-main, inherit)))',
                fontWeight: 'var(--sarak-identity-weight, 800)',
                letterSpacing: 'var(--sarak-identity-tracking, 0px)',
                lineHeight: BRAND_NAME_LINE_HEIGHT,
                width: 'fit-content',
                maxWidth: `min(${maxWidth}, 100%)`,
                color: onBrandFill
                    ? horizontal
                        ? 'var(--sarak-topbar-brand-color, var(--sarak-topbar-title-color, var(--color-theme-title, inherit)))'
                        : 'var(--sarak-sidebar-brand-color, var(--sarak-on-sidebar, #f2f6fb))'
                    : horizontal
                        ? 'var(--sarak-topbar-title-color, var(--color-theme-title, inherit))'
                        : 'var(--sarak-sidebar-item-hover-text-color, var(--sarak-on-sidebar, #f2f6fb))',
            }}
        >
            {name}
        </span>
    );
};

/**
 * Identidade do cromo: slot `logo` (quando presente) tem precedência sobre `brand.logoUrl`. `brandDisplay` escolhe o que a
 * marca mostra: logo e nome, só o logo (cai no nome quando não há imagem) ou só o nome.
 */
export const ChromeBrand: React.FC<{
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    horizontal?: boolean;
    /** Colapsado (`isNavHidden`): mantém o logo, esconde o nome. */
    compact?: boolean;
    /**
     * Dentro da faixa do cabeçalho da lateral: quem pinta o fundo da marca e dá a altura é a faixa; aqui sobra só o
     * respiro lateral, e a marca sem logo ganha o monograma.
     */
    band?: boolean;
}> = ({ brand, logo, horizontal, compact, band }) => {
    const { brandDisplay } = useNavigationAppearance();
    const hasImage = Boolean(logo || brand?.logoUrl);
    const hasName = Boolean(brand?.name);
    if (!hasImage && !hasName) return null;
    const showLogo = hasImage && brandDisplay !== 'name';
    const showName = hasName && (brandDisplay !== 'logo' || !hasImage);
    const showMonogram = band && !showLogo && hasName;
    // Recolhido o nome some: sem logo nem monograma, não sobraria nada dentro do bloco — nem a caixa colorida.
    if (!showLogo && !showMonogram && compact) return null;
    return (
        // O invólucro leva o respiro do token `identityPadding` (padrão 0, soma-se ao respiro
        // base do bloco); o bloco interno mantém a anatomia de sempre. Fora da faixa, o fundo da marca só pinta com
        // logo: sem imagem, o bloco é só o nome (ou nada), nunca uma caixa colorida. Na barra do topo a marca não
        // encolhe para dar espaço às abas: quem cede é a lista delas.
        <div
            className={`relative z-10 ${horizontal ? 'shrink-0' : 'min-w-0'}`}
            style={{
                padding: band ? undefined : 'var(--sarak-identity-padding, 16px)',
                paddingInline: band && !compact ? 'var(--sarak-identity-padding, 16px)' : undefined,
                background: band || !showLogo ? undefined : horizontal
                    ? 'var(--sarak-topbar-brand-bg, transparent)'
                    : 'var(--sarak-sidebar-brand-bg, transparent)',
            }}
        >
            <div className={`sarak-chrome-brand flex items-center gap-2 min-w-0 ${horizontal || band ? '' : 'px-2 py-3'} ${compact ? 'justify-center' : ''}`}>
                {showMonogram && <ChromeBrandMonogram name={brand?.name ?? ''} />}
                {showLogo && (logo
                    ? <span data-sarak-slot="logo" className="flex items-center shrink-0 min-w-0">{logo}</span>
                    : brand?.logoUrl && (
                        // `shellBrandLogoSize`/`brandLogoSizeCollapsed` (Spec 05 §2.4) — altura
                        // por token em vez do quadrado fixo; a largura acompanha por
                        // `object-contain`, igual ao Shell (`SidebarNav`/`TopbarNav`).
                        <img
                            src={brand.logoUrl}
                            alt=""
                            className="object-contain shrink-0"
                            style={{ height: compact ? 'var(--sarak-brand-logo-size-collapsed, 20px)' : 'var(--sarak-shell-brand-logo-size, 32px)' }}
                        />
                    ))}
                {showName && !compact && <ChromeBrandName name={brand?.name ?? ''} horizontal={horizontal} onBrandFill={Boolean(band || showLogo)} />}
            </div>
        </div>
    );
};

/**
 * Camada decorativa ATRÁS do conteúdo do cromo (slot `decoration`).
 *
 * Acessibilidade (L2): é ornamento — sai da árvore de acessibilidade (`aria-hidden`)
 * e não captura foco nem toque (`pointer-events: none`), então nunca rouba interação
 * da nav/conteúdo. Complementa (não substitui) o fundo GLOBAL por tema do Design
 * Engine (`SarakBackgroundRenderer`), que continua sendo o caminho de fundo do app.
 */
export const ChromeDecoration: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    if (!children) return null;
    return (
        <div
            data-sarak-slot="decoration"
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
        >
            {children}
        </div>
    );
};

/**
 * Faixa full-width do cromo: `banner` (topo, acima da barra de navegação) e
 * `footer` (base, abaixo do conteúdo). Não impõe fundo, borda nem padding — a
 * região é só geometria; a estética é do conteúdo do consumidor. `min-w-0` +
 * `w-full` garantem o refluxo no celular (Spec 40.3): a faixa acompanha a largura
 * disponível em vez de estourar a tela.
 */
export const ChromeStrip: React.FC<{ region: 'banner' | 'footer'; children?: React.ReactNode }> = ({ region, children }) => {
    if (!children) return null;
    return (
        <div data-sarak-slot={region} className="relative w-full min-w-0 shrink-0">
            {children}
        </div>
    );
};

/**
 * Região no topo/rodapé da sidebar (slots `sidebarHeader`/`sidebarFooter`). No
 * celular a sidebar não existe: estas regiões migram para o drawer (Spec 48 — L2).
 * Padding por token de layout (`--sarak-layout-gap-sm`) para o conteúdo não
 * encostar na borda da sidebar.
 */
export const ChromeSidebarSlot: React.FC<{ region: 'header' | 'footer'; children?: React.ReactNode }> = ({ region, children }) => {
    if (!children) return null;
    return (
        <div
            data-sarak-slot={region === 'header' ? 'sidebarHeader' : 'sidebarFooter'}
            className="relative z-10 min-w-0 shrink-0"
            style={{
                padding: 'var(--sarak-layout-gap-sm, 8px)',
                background: region === 'footer' ? 'var(--sarak-sidebar-footer-bg, transparent)' : undefined,
            }}
        >
            {children}
        </div>
    );
};

/**
 * Região no início/fim da barra superior (slots `topbarStart`/`topbarEnd`).
 * `topbarEnd` é o alias de `topbarActions` (compat preservada). `min-w-0` deixa o
 * conteúdo comprimir no celular em vez de empurrar a barra (L2).
 */
export const ChromeTopbarSlot: React.FC<{ region: 'start' | 'end'; children?: React.ReactNode; className?: string }> = ({ region, children, className = '' }) => {
    if (!children) return null;
    return (
        <div
            data-sarak-slot={region === 'start' ? 'topbarStart' : 'topbarEnd'}
            className={`relative z-10 flex items-center gap-2 min-w-0 ${region === 'end' ? 'shrink-0' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

/**
 * Posição da BUSCA (`searchPositionSidebar`/`searchPositionTopbar`): a lib dá
 * a região onde o conteúdo de busca aparece; o consumidor dá o conteúdo
 * (prop `search`, tipicamente um `ShellSearchWidget`). `position: 'hidden'` some
 * a região mesmo com `children` — é a única exceção ao princípio "ausente = não
 * renderiza" desta família, porque aqui quem decide sumir é o TOKEN, não a
 * ausência de conteúdo.
 */
export const ChromeSearchSlot: React.FC<{
    position: 'top' | 'bottom' | 'left' | 'center' | 'right' | 'hidden';
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}> = ({ position, className = '', style, children }) => {
    if (!children || position === 'hidden') return null;
    return (
        <div data-sarak-slot="search" className={`relative z-10 min-w-0 ${className}`} style={style}>
            {children}
        </div>
    );
};
