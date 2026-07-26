import React from 'react';

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

/** Identidade do cromo: slot `logo` (quando presente) tem precedência sobre `brand.logoUrl`. */
export const ChromeBrand: React.FC<{
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    horizontal?: boolean;
}> = ({ brand, logo, horizontal }) => {
    if (!logo && !brand?.name && !brand?.logoUrl) return null;
    return (
        <div className={`flex items-center gap-2 min-w-0 ${horizontal ? '' : 'px-2 py-3'}`}>
            {logo
                ? <span data-sarak-slot="logo" className="flex items-center shrink-0 min-w-0">{logo}</span>
                : brand?.logoUrl && <img src={brand.logoUrl} alt="" className="h-6 w-6 object-contain shrink-0" />}
            {brand?.name && (
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
            className="min-w-0 shrink-0"
            style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}
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
            className={`flex items-center gap-2 min-w-0 ${region === 'end' ? 'shrink-0' : ''} ${className}`}
        >
            {children}
        </div>
    );
};
