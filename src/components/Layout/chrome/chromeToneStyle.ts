import type { CSSProperties } from 'react';
import type { NavigationBarTone } from '../../../core/Provider/useNavigationAppearance';
import { resolveChromeToneContrastColors } from './chromeToneContrast';

type Bar = 'sidebar' | 'topbar';

/** O fundo de cada barra, para o texto sobre a cor primária do widget (idioma ativo) seguir legível. */
const BAR_BACKGROUND: Record<Bar, string> = {
    sidebar: 'var(--sarak-sidebar-bg)',
    topbar: 'var(--sarak-topbar-bg)',
};

/** Papéis que escurecem a barra (ou a invertem em relação ao corpo): o texto do corpo deixa de valer sobre ela. */
const CONTRASTING_TONES: readonly NavigationBarTone[] = ['primary', 'secondary', 'inverse'];

/** Os tokens da própria barra, por nome: o texto comum, o texto forte (hover) e a borda. Escritos por extenso para o auditor de variáveis ler cada um. */
const BAR_TOKENS: Record<Bar, { text: string; strong: string; border: string }> = {
    sidebar: {
        text: 'var(--sarak-sidebar-item-text-color)',
        strong: 'var(--sarak-sidebar-item-hover-text-color)',
        border: 'var(--sarak-sidebar-border-color)',
    },
    topbar: {
        text: 'var(--sarak-topbar-item-text-color)',
        strong: 'var(--sarak-topbar-item-hover-text-color)',
        border: 'var(--sarak-topbar-border-color)',
    },
};

/**
 * Num papel contrastante, a barra refaz as variáveis dos widgets com a cor forte calculada para a pior parada e mede o
 * véu ativo com a opacidade declarada pela paleta. No papel de superfície, só corrige o texto forte quando o fundo autorado
 * pede. Num papel neutro ou sem cores literais resolvíveis, mantém o estilo de sempre.
 */
export const resolveChromeToneStyle = (tone: NavigationBarTone, bar: Bar, design?: Record<string, unknown>): CSSProperties => {
    if (tone === 'neutral') return {};
    const { text, strong, border } = BAR_TOKENS[bar];
    const contrastColors = resolveChromeToneContrastColors(tone, bar, design);
    const resolvedStrong = contrastColors.strongTextColor ?? strong;
    if (!CONTRASTING_TONES.includes(tone)) {
        if (!contrastColors.strongTextColor) return {};
        return {
            [`--sarak-${bar}-item-hover-text-color`]: resolvedStrong,
            '--sarak-nav-active-color': resolvedStrong,
            // A cor forte também pinta o fundo do controle escolhido (Lateral, P/M/G): o texto sobre ele é o fundo da barra, o par oposto, e não o texto do botão primário.
            '--sarak-on-nav-active': BAR_BACKGROUND[bar],
            '--theme-title': resolvedStrong,
        } as CSSProperties;
    }
    const veil = `color-mix(in srgb, ${resolvedStrong} 16%, transparent)`;
    const style: Record<string, string> = {
        color: text,
        '--sarak-nav-active-color': resolvedStrong,
        // O item ativo preenchido (`*ActiveItemStyle: filled`) pinta o fundo com a cor acima; o texto sobre ele é o fundo da barra, o par que a paleta garante.
        '--sarak-on-nav-active': BAR_BACKGROUND[bar],
        '--text-muted': text,
        '--theme-muted': text,
        '--text-main': resolvedStrong,
        '--sarak-text-main': resolvedStrong,
        '--theme-text-primary': resolvedStrong,
        [`--sarak-${bar}-item-hover-text-color`]: resolvedStrong,
        // O nome, o avatar, o seletor de idioma e a engrenagem (o botão fantasma lê `--sarak-primary-color`) leem a cor primária e os títulos do corpo: dentro da barra
        // contrastante eles seguem o texto forte dela, e o texto sobre a cor primária (idioma ativo) segue o fundo da barra.
        '--theme-primary': resolvedStrong,
        // O botão de sair (variante mini: topbar e lateral recolhida) mistura o vermelho de erro com `--sarak-on-surface`.
        '--sarak-on-surface': resolvedStrong,
        '--sarak-primary-color': resolvedStrong,
        '--theme-title': resolvedStrong,
        '--theme-subtitle': text,
        '--sarak-subtitle-color': text,
        '--theme-on-primary': BAR_BACKGROUND[bar],
        '--border-color': border,
        '--theme-border': border,
        // Superfícies pequenas dentro da barra (selo, usuário, campo de busca): um véu do texto forte sobre o fundo da barra, e não o
        // fundo claro do cartão do corpo, que apagaria o texto claro dela.
        '--theme-card': veil,
        '--color-theme-card': veil,
        '--sarak-card-bg': veil,
        '--sarak-input-bg': veil,
        '--sarak-input-text-color': resolvedStrong,
        '--sarak-input-icon-color': text,
        '--sarak-input-border-color': border,
    };
    if (contrastColors.idleTextColor) style[`--sarak-${bar}-item-text-color`] = contrastColors.idleTextColor;
    if (contrastColors.activeBackgroundColor) style[`--sarak-${bar}-active-color`] = contrastColors.activeBackgroundColor;
    if (contrastColors.logoutTextColor) Object.assign(style, { '--sarak-shell-logout-text-color': contrastColors.logoutTextColor });
    return style as CSSProperties;
};
