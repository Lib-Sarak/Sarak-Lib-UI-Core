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

export const CHROME_WIDGET_POSITION_TOKEN_IDS: Record<SarakChromeWidgetId, string> = {
    ...PREFERENCE_POSITION_TOKEN_IDS,
    search: 'chromeSearchPosition',
    user: 'chromeUserPosition',
    notifications: 'chromeNotificationsPosition',
};

const POSITION_OPTIONS = [
    { value: 'off', label: 'Não oferecida' },
    { value: 'menu', label: 'No menu' },
    { value: 'pinned', label: 'Fixa na barra' },
];

const buildPositionToken = (
    id: string,
    label: string,
    description: string,
    defaultValue: SarakPreferencePosition,
): NonNullable<ComponentSchema['tokens']>[number] => ({
    id,
    label,
    type: 'select' as const,
    description,
    constraints: { options: POSITION_OPTIONS },
    defaultValue,
});

/**
 * Padrão de fábrica: todos os widgets e preferências ficam fixos na barra.
 */
export const PreferencesSchema: ComponentSchema = {
    id: 'preferences',
    label: 'Preferências do Usuário',
    tokens: [
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.colorMode,
            'Preferência: Modo Claro/Escuro',
            'Onde a escolha de modo (claro/escuro/sistema) do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'pinned',
        ),
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.fontSize,
            'Preferência: Tamanho da Fonte',
            'Onde a escolha de tamanho de fonte (P/M/G) do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'pinned',
        ),
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.navigationStyle,
            'Preferência: Navegação Topo/Lateral',
            'Onde a escolha de orientação da navegação (topo/lateral) do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'pinned',
        ),
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.navCollapsed,
            'Preferência: Navegação Recolhida',
            'Onde o controle de recolher a navegação do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'pinned',
        ),
        buildPositionToken(
            PREFERENCE_POSITION_TOKEN_IDS.language,
            'Preferência: Idioma',
            'Onde a escolha de idioma do usuário final aparece — não oferecida, no menu ⚙, ou fixa na barra.',
            'pinned',
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
