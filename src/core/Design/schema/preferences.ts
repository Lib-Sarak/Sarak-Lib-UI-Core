import { ComponentSchema } from '../types';
import { NavigationSchema } from './navigation';

/**
 * As cinco preferências de usuário que a lib conhece (specs/09 — seção de
 * preferências) e o token de tema que guarda, para cada uma, a POSIÇÃO que o
 * administrador escolheu no painel: `off` (não oferecida — some da barra,
 * some do menu), `menu` (item dentro do ⚙ "Preferências") ou `pinned` (botão
 * direto na barra, e também no menu). A declaração vive no `design`, como
 * qualquer outro token de tema — não num campo fora dele: é o administrador
 * quem escolhe isso em runtime, no painel, e só sobrevive a um recarregamento
 * se estiver onde o `design` já é persistido.
 */
export const PREFERENCE_IDS = ['colorMode', 'fontSize', 'navigationStyle', 'navCollapsed', 'language'] as const;

export type SarakPreferenceId = typeof PREFERENCE_IDS[number];

export type SarakPreferencePosition = 'off' | 'menu' | 'pinned';

export const CHROME_WIDGET_IDS = [
    'colorMode', 'fontSize', 'navigationStyle', 'navCollapsed', 'language',
    'search', 'user', 'notifications',
] as const;

export type SarakChromeWidgetId = typeof CHROME_WIDGET_IDS[number];

/** Token de tema — sob a paridade de três fontes (R4) — que guarda a posição
 *  de cada preferência. Fonte única: nunca compor o nome à mão fora daqui. */
export const PREFERENCE_POSITION_TOKEN_IDS: Record<SarakPreferenceId, string> = {
    colorMode: 'preferenceModePosition',
    fontSize: 'preferenceFontSizePosition',
    navigationStyle: 'preferenceNavigationStylePosition',
    navCollapsed: 'preferenceNavCollapsePosition',
    language: 'preferenceLanguagePosition',
};

/**
 * O recolher da Topbar é lido por um token próprio: a lateral mostra a seta do cabeçalho por padrão
 * (`preferenceNavCollapsePosition`), e o topo só mostra o ≡ quando o sistema o liga aqui.
 */
export const NAV_COLLAPSE_TOPBAR_POSITION_TOKEN_ID = 'preferenceNavCollapsePositionTopbar';

export const CHROME_WIDGET_POSITION_TOKEN_IDS: Record<SarakChromeWidgetId, string> = {
    ...PREFERENCE_POSITION_TOKEN_IDS,
    search: 'chromeSearchPosition',
    user: 'chromeUserPosition',
    notifications: 'chromeNotificationsPosition',
};

const POSITION_OPTIONS = [
    { value: 'off', label: 'Esconder' },
    { value: 'menu', label: 'No menu' },
    { value: 'pinned', label: 'Mostrar' },
];

/** O que cada posição muda na tela (medido no cromo): o controle sai da barra, vai para o menu ⚙ ou some. */
const POSITION_USAGE: Record<string, string> = {
    preferenceModePosition: "Posição da escolha de Light mode ou Dark mode do usuário: fixa na barra, no menu de preferências ou não oferecida; quando some, a escolha não existe para o usuário.",
    preferenceFontSizePosition: "Posição da escolha de tamanho da fonte (P/M/G): fixa, no menu de preferências ou não oferecida.",
    preferenceNavigationStylePosition: "Posição da escolha de orientação da navegação (lateral/topo): fixa, no menu de preferências ou não oferecida.",
    preferenceNavCollapsePosition: "Posição do botão de recolher a navegação na Sidebar: fixo (a seta da própria Sidebar), no menu de preferências ou não oferecido.",
    preferenceNavCollapsePositionTopbar: "Posição do botão de menu (≡) que compacta a Topbar: fixo, no menu de preferências ou não oferecido; por padrão fica só no menu.",
    preferenceLanguagePosition: "Posição da escolha de idioma: fixa, no menu de preferências ou não oferecida.",
};

const buildPositionToken = (
    id: string,
    label: string,
    description: string,
    defaultValue: SarakPreferencePosition,
): NonNullable<ComponentSchema['tokens']>[number] => ({
    id,
    kind: 'functional',
    modeDependent: false,
    usage: POSITION_USAGE[id],
    label,
    type: 'select' as const,
    description,
    constraints: { options: POSITION_OPTIONS },
    defaultValue,
});

/** Os dois degraus da preferência de tamanho da fonte, em px sobre `bodySize`: quanto P reduz e quanto G aumenta. */
export const FONT_SIZE_REDUCTION_TOKEN_ID = 'preferenceFontSizeReduction';
export const FONT_SIZE_INCREASE_TOKEN_ID = 'preferenceFontSizeIncrease';

const buildFontSizeStepToken = (
    id: string,
    label: string,
    description: string,
    usage: string,
): NonNullable<ComponentSchema['tokens']>[number] => ({
    id,
    kind: 'functional',
    modeDependent: false,
    usage,
    interactsWith: ['bodySize', PREFERENCE_POSITION_TOKEN_IDS.fontSize],
    label,
    type: 'slider',
    description,
    axis: 'density',
    unit: 'px',
    constraints: { min: 0, max: 6, step: 1 },
    defaultValue: 2,
});

/**
 * Padrão de fábrica: controles essenciais ficam fixos; escolhas de layout e
 * tipografia ficam agrupadas no menu de preferências.
 */
export const PreferencesSchema: ComponentSchema = {
    id: 'preferences',
    label: 'Preferências do Usuário',
    tokens: [
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.colorMode,
            'Preferência: Light mode ou Dark mode',
            'Onde a escolha de Light mode, Dark mode ou do sistema do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'menu',
        ),
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.fontSize,
            'Preferência: Tamanho da Fonte',
            'Onde a escolha de tamanho de fonte (P/M/G) do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'menu',
        ),
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.navigationStyle,
            'Preferência: Navegação Topo/Lateral',
            'Onde a escolha de orientação da navegação (topo/lateral) do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'menu',
        ),
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.navCollapsed,
            'Preferência: Navegação Recolhida',
            'Onde o controle de recolher a navegação lateral do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'pinned',
        ),
        buildPositionToken(
            NAV_COLLAPSE_TOPBAR_POSITION_TOKEN_ID,
            'Preferência: Menu da Topbar',
            'Onde o botão de menu (≡) que compacta a Topbar aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'menu',
        ),
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.language,
            'Preferência: Idioma',
            'Onde a escolha de idioma do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'pinned',
        ),
        buildFontSizeStepToken(
            FONT_SIZE_REDUCTION_TOKEN_ID,
            'Tamanho da Fonte: Quanto o P Reduz',
            'Quantos pixels a opção P do usuário final tira do tamanho global das fontes (`bodySize`). Com 2 e base de 14 px, o P entrega 12 px.',
            'Redução, em px, que a preferência P aplica sobre `bodySize`: P = `bodySize` − este valor (piso de 8 px). Só vale quando a escolha de tamanho da fonte é oferecida ao usuário.',
        ),
        buildFontSizeStepToken(
            FONT_SIZE_INCREASE_TOKEN_ID,
            'Tamanho da Fonte: Quanto o G Aumenta',
            'Quantos pixels a opção G do usuário final soma ao tamanho global das fontes (`bodySize`). Com 2 e base de 14 px, o G entrega 16 px.',
            'Aumento, em px, que a preferência G aplica sobre `bodySize`: G = `bodySize` + este valor. Só vale quando a escolha de tamanho da fonte é oferecida ao usuário.',
        ),
    ],
};

/** Padrão de fábrica de cada token — fonte única para quando a chave está
 *  ausente do `design` (ex.: um modelo do painel que substitui o design
 *  inteiro por um do catálogo, sem as chaves novas). */
const POSITION_TOKENS = [
    ...PreferencesSchema.tokens,
    ...NavigationSchema.tokens.filter((token) =>
        Object.values(CHROME_WIDGET_POSITION_TOKEN_IDS).includes(token.id),
    ),
];

const DEFAULT_POSITIONS: Record<string, SarakPreferencePosition> = Object.fromEntries(
    POSITION_TOKENS.map((token) => [token.id, token.defaultValue as SarakPreferencePosition]),
);

const isChromeWidgetPosition = (value: unknown): value is SarakPreferencePosition =>
    value === 'off' || value === 'menu' || value === 'pinned';

export const getChromeWidgetPosition = (
    design: Record<string, unknown> | undefined,
    id: SarakChromeWidgetId,
): SarakPreferencePosition => {
    const tokenId = CHROME_WIDGET_POSITION_TOKEN_IDS[id];
    const value = design?.[tokenId];
    return isChromeWidgetPosition(value) ? value : DEFAULT_POSITIONS[tokenId];
};

/** A posição do recolher na Topbar: o token próprio, e na falta dele o padrão de fábrica (no menu). */
export const getNavCollapsePositionTopbar = (design: Record<string, unknown> | undefined): SarakPreferencePosition => {
    const value = design?.[NAV_COLLAPSE_TOPBAR_POSITION_TOKEN_ID];
    return isChromeWidgetPosition(value) ? value : DEFAULT_POSITIONS[NAV_COLLAPSE_TOPBAR_POSITION_TOKEN_ID];
};

/**
 * Lê a posição de `id` diretamente do `design` (nunca de um campo fora
 * dele) — qualquer valor além de `'off'` conta como oferecida. Chave AUSENTE
 * cai no padrão de fábrica do próprio token.
 */
export const isPreferenceOffered = (design: Record<string, unknown> | undefined, id: SarakPreferenceId): boolean => {
    return getPreferencePosition(design, id) !== 'off';
};

/**
 * Lê a POSIÇÃO efetiva de `id` — mesma leitura de `isPreferenceOffered`
 * (chave ausente cai no padrão de fábrica do PRÓPRIO token), só que devolve o
 * valor em vez do booleano. Fonte única dos defaults: quem precisa saber
 * "fixada ou no menu" (a barra configurável pelo administrador) lê por aqui,
 * nunca reconstrói a tabela de defaults em outro arquivo.
 */
export const getPreferencePosition = (design: Record<string, unknown> | undefined, id: SarakPreferenceId): SarakPreferencePosition => {
    return getChromeWidgetPosition(design, id);
};
