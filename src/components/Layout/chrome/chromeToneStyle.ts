import type { CSSProperties } from 'react';
import type { NavigationBarTone } from '../../../core/Provider/useNavigationAppearance';

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
 * Num papel contrastante a barra refaz, só para os seus descendentes, as variáveis de texto, ícone e borda do corpo a
 * partir dos tokens da própria barra — que a paleta calculou legíveis sobre o fundo dela. Assim os widgets que não
 * conhecem a barra (preferências, usuário, busca) acompanham o fundo sem cada um ganhar um token novo; o texto do item
 * ativo (`navItemActiveColor`, a ênfase global) também vira o texto forte da barra, que é o que a paleta garante sobre
 * o fundo ativo dela. Num papel neutro ou de superfície devolve vazio: nada muda.
 */
export const resolveChromeToneStyle = (tone: NavigationBarTone, bar: Bar): CSSProperties => {
    if (!CONTRASTING_TONES.includes(tone)) return {};
    const { text, strong, border } = BAR_TOKENS[bar];
    const veil = `color-mix(in srgb, ${strong} 16%, transparent)`;
    const style: Record<string, string> = {
        color: text,
        '--sarak-nav-active-color': strong,
        '--text-muted': text,
        '--theme-muted': text,
        '--text-main': strong,
        '--sarak-text-main': strong,
        '--theme-text-primary': strong,
        // O nome, o avatar, o seletor de idioma e a engrenagem (o botão fantasma lê `--sarak-primary-color`) leem a cor primária e os títulos do corpo: dentro da barra
        // contrastante eles seguem o texto forte dela, e o texto sobre a cor primária (idioma ativo) segue o fundo da barra.
        '--theme-primary': strong,
        // O botão de sair (variante mini: topbar e lateral recolhida) mistura o vermelho de erro com `--sarak-on-surface`.
        '--sarak-on-surface': strong,
        '--sarak-primary-color': strong,
        '--theme-title': strong,
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
        '--sarak-input-text-color': strong,
        '--sarak-input-icon-color': text,
        '--sarak-input-border-color': border,
    };
    return style as CSSProperties;
};
