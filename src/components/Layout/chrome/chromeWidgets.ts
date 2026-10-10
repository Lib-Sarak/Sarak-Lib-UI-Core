/**
 * Widgets do cromo que nascem MONTADOS por padrão no `SarakAppChrome` — busca (com
 * atalho Ctrl/Cmd+K), alternância de tema, usuário, notificações e preferências de
 * tamanho da fonte, orientação da navegação, idioma e colapso.
 * Omitir um campo mantém o widget ligado; só `false` explícito desliga aquele, isolado
 * dos demais. Redimensionamento por arraste e auto-hide continuam fora do default —
 * não têm campo aqui de propósito.
 */
export interface SarakChromeWidgets {
    /** Busca (slot `search`) — trigger + atalho Ctrl/Cmd+K. Default: ligado. */
    search?: boolean;
    /** Alternância de tema claro/escuro. Default: ligado. */
    themeToggle?: boolean;
    /** Identidade do usuário + logout. Default: ligado. */
    user?: boolean;
    /** Widget de notificações. Default: ligado. */
    notifications?: boolean;
    /** Preferência de tamanho da fonte. Default: ligado. */
    fontSize?: boolean;
    /** Preferência de orientação da navegação. Default: ligado. */
    navigationStyle?: boolean;
    /** Preferência de idioma. Default: ligado. */
    language?: boolean;
    /** Colapso da navegação (sidebar ícone-only / topbar reduzida) no desktop. Default: ligado. */
    collapse?: boolean;
}

/** Omitido (`undefined`) = ligado; só `false` desliga. */
export const isChromeWidgetEnabled = (flag: boolean | undefined): boolean => flag !== false;
