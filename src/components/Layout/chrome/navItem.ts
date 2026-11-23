import React from 'react';
import type { SarakSearchItem } from '../../atomic/Inputs/SarakSearch';
import { SarakIcon } from '../../atomic/Icon/SarakIcon';
import type { SarakShellNavItem } from '../../atomic/Navigation/SarakShellNav';

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
 *
 * Mora em `chrome/` (e não no `SarakAppChrome.tsx`) só por higiene de tamanho de
 * arquivo — o tipo continua público pelo mesmo caminho (re-export no cromo + barril).
 */
export interface SarakNavItem {
    /** Identidade estável do item (chave de render; não precisa ser a URL). */
    id: string;
    /** Rótulo exibido ao lado do ícone. */
    label: string;
    /** Nome registrado ou elemento do ícone fornecido pelo consumidor. Opcional. */
    icon?: string | React.ReactNode;
    /** URL de destino — o host navega para cá (redirect de página, router, etc.). */
    href: string;
    /** Marca o item como ativo (destaque + `aria-current="page"`). */
    active?: boolean;
    /** Impede navegação e foco sem remover o item do menu. */
    disabled?: boolean;
    /** Informação visual que também integra o nome acessível. */
    badge?: string | number;
    /** Contexto nativo da âncora. */
    target?: string;
    /** Agrupamento visual — mesmo campo do `ShellNavItem`; itens sem categoria ficam no grupo raiz. */
    category?: string;
    /**
     * Sub-abas: o item vira um grupo recolhível (botão com seta) e a `href` dele deixa de navegar. Um nível só —
     * filhos de filhos são ignorados. Um filho pode ser o `active`: o grupo dele abre sozinho.
     */
    children?: SarakNavItem[];
    /** Grupo aberto de saída; o grupo do item ativo abre sozinho, com ou sem isto. */
    defaultExpanded?: boolean;
}

const toShellNavItem = (
    { label, href, icon, category, disabled, badge, target }: SarakNavItem,
): SarakShellNavItem => ({ label, route: href, icon, category, disabled, badge, target });

/**
 * O modelo estruturado (`navItems`) no contrato do `SarakShellNav`: os mesmos campos com `href` como rota, e os
 * filhos de um nível repassados com `defaultExpanded`. Quem não passa `children` recebe exatamente o de antes.
 */
export const toShellNavItems = (items: readonly SarakNavItem[]): SarakShellNavItem[] => items.map((item) => {
    const base = toShellNavItem(item);
    if (!item.children || item.children.length === 0) return base;
    return {
        ...base,
        children: item.children.map(toShellNavItem),
        ...(item.defaultExpanded !== undefined ? { defaultExpanded: item.defaultExpanded } : {}),
    };
});

/** A `href` do item marcado `active`, procurado também entre os filhos (o primeiro achado vence). */
export const findActiveNavItemHref = (items: readonly SarakNavItem[]): string | undefined => {
    for (const item of items) {
        if (item.active) return item.href;
        const child = item.children?.find((entry) => entry.active);
        if (child) return child.href;
    }
    return undefined;
};

export const getSarakSearchItems = (items: readonly {
    route: string;
    label: string;
    category?: string;
    icon?: string | React.ReactNode;
    disabled?: boolean;
}[]): SarakSearchItem[] => items
    .filter((item) => !item.disabled)
    .map(({ route, label, category, icon }) => ({
        id: route,
        label,
        category,
        icon: typeof icon === 'string' ? React.createElement(SarakIcon, { name: icon, size: 14 }) : icon,
    }));
