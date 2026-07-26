/**
 * TEMPLATE — a navegação do sistema, definida UMA vez.
 *
 * O cromo é por-app (cada app renderiza o seu `SarakAppChrome`), então o que faz o
 * menu ser idêntico em toda aba é este arquivo ser compartilhado. Cada app só marca
 * qual item está ativo, conforme a própria rota.
 */
import type { SarakNavItem } from '@sarak/lib-ui-core';

/**
 * `icon` aceita SÓ nomes do catálogo curado: `sarak-ui/catalog.json` → `tokens.iconNames`.
 * O mesmo nome vale nas três famílias de ícone — trocar a família pelo tema repinta
 * todos sem mexer aqui. Nome inventado não renderiza o ícone pedido: vira `console.warn`
 * + ícone de alerta. Confira no catálogo antes de escrever.
 */
export const NAV: SarakNavItem[] = [
    { id: 'inicio', label: 'Início', icon: 'Home', href: '/' },
    { id: 'design', label: 'Aparência', icon: 'Palette', href: '/design' },
];

/**
 * Como cada app usa (veja `main.tsx`):
 *
 *   const itens = NAV.map((item) => ({ ...item, active: rota.startsWith(item.href) }));
 *   <SarakAppChrome navItems={itens} onNavigate={navegar}>…</SarakAppChrome>
 *
 * `onNavigate` recebe o `href` e QUEM NAVEGA É VOCÊ — roteador de SPA, `history.pushState`
 * ou `window.location.assign` para pular entre apps de deploys diferentes. A lib não
 * escolhe o seu roteador.
 */
