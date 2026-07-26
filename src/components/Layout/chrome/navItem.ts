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
    /** Nome do ícone (resolvido pelo `SarakIcon`/`IconMap` curado). Opcional. */
    icon?: string;
    /** URL de destino — o host navega para cá (redirect de página, router, etc.). */
    href: string;
    /** Marca o item como ativo (destaque + `aria-current="page"`). */
    active?: boolean;
}
