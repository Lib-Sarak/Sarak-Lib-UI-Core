/**
 * Ponto de entrada do harness de medição de CSS renderizado (specs/specs/11-testes-e-cobertura.md §7.3).
 *
 * Renderiza o CROMO PÚBLICO de verdade (`SarakUIProvider` + `SarakAppChrome`) contra o
 * pacote PUBLICADO (`@sarak/lib-ui-core`, resolvido para `dist/index.js` via alias do
 * bundler do harness — ver `build-harness.mjs`) — não um mock, não uma reimplementação
 * das classes. O que o navegador calcula aqui é exatamente o que um consumidor real
 * recebe, porque é o mesmo artefato (`dist/`) que o consumidor instala.
 *
 * Um único conjunto NOMEADO de itens de navegação, com `id`/`href`/`label` estáveis —
 * o teste (`cromo-css-real.spec.ts`) mira neles por `getByRole('link', { name })`,
 * nunca por seletor de estrutura interna.
 *
 * `?bg=1` na URL liga `globalBackgroundImageUrl` no `SarakUIProvider` — o MESMO App,
 * com/sem mídia de fundo global, para medir o `background-color` computado da raiz do
 * cromo (`className="sarak-chrome-root"`, o contrato público que a própria raiz expõe)
 * nos dois estados, sem duplicar Provider/nav na página (specs/specs/05-cromo-e-slots.md §3).
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    SarakUIProvider,
    useToast,
    sarakGetDefaultDesignState,
    SarakAccordion,
    SarakActionCard,
    SarakBadge,
    SarakCard,
    SarakModal,
    SarakSearchCard,
    SarakTable,
    SarakTooltip,
    SarakAppChrome,
    SarakAuthScreen,
    SarakButton,
    SarakCalendar,
    SarakCatalogGrid,
    SarakGantt,
    SarakKanban,
    SarakCustomizationPanel,
    SarakDesignScope,
    SarakExpandableMatrix,
    SarakFilterSelect,
    SarakHelpButton,
    SarakIconButton,
    SarakImageCard,
    SarakInput,
    SarakLightbox,
    SarakMenuItem,
    SarakRangeSlider,
    SarakSearch,
    SarakSelect,
    SarakShellUserWidget,
    SarakSwitch,
    SarakTabs,
    SarakTextarea,
    SarakTimePicker,
    SarakTitleCard,
} from '@sarak/lib-ui-core';

const NAV_ITEMS = [
    { id: 'inicio', label: 'Início', href: '/inicio' },
    { id: 'relatorios', label: 'Relatórios', href: '/relatorios', active: true },
    ...Array.from({ length: 30 }, (_, index) => ({
        id: `secao-${index + 1}`,
        label: `Seção ${index + 1}`,
        href: `/secao-${index + 1}`,
    })),
];

const searchParams = new URLSearchParams(window.location.search);
const hasGlobalBackground = searchParams.get('bg') === '1';
const navigationStyle = searchParams.get('chrome') === 'topbar' ? 'topbar' : 'sidebar';
const embeddedStyle = searchParams.get('embedded') === '1' ? { height: '320px' } : undefined;
// Mantém a viewport fixa e varia a largura do host para distinguir container query de breakpoint de janela.
const hostWidth = searchParams.get('host') === 'narrow'
    ? '50vw'
    : searchParams.get('host') === 'wide'
        ? '90vw'
        : undefined;

/**
 * `?tema=<nome>` troca a `config` do Provider por um recorte de tokens nomeado — o mesmo
 * App, para medir um valor de token que o tema default não exercita.
 *   - `borda-tracejada`: `borderStyle` = `dashed`, o valor que a ponte do token leva a
 *     todo elemento com classe de borda.
 *   - `botao-cantos`: raio mestre 0 e os quatro cantos em 9999 (o desenho do
 *     `minimalist-airy`). Com mestre igual aos cantos, o caso não distinguiria nada.
 *   - `cromo-cor`: `topbarColor` troca o fundo computado da barra.
 *   - `cromo-gap`: `tabGap` troca o espaçamento computado entre itens.
 *   - `cromo-margem`: `tabSectionMargin` troca a margem computada da barra.
 *   - `cromo-estrutura`: `isNavHidden` seleciona a geometria compacta da topbar.
 *   - `cromo-largura-limitada` / `cromo-largura-fluida`: `maxContentWidth` limita ou libera a região.
 *   - `cromo-densidade-*`: `layoutDensity` escala o respiro da região de conteúdo.
 *   - `cromo-vista-dividida`: `isSplitViewEnabled` habilita o slot `secondaryContent`.
 *   - `toque-alvo-largo`: `touchTargetMin` = 56, para provar que o alvo de toque segue o token.
 *   - `corpo-pequeno`: `bodySize` = 12px, o corpo de texto de 11 dos 14 temas, que o campo não pode herdar no celular.
 *   - `movimento-reduzido`: `reducedMotion` ligado.
 *   - `navegacao-celular-base` / `navegacao-celular-gaveta`: `mobileNavigationStyle` forçado em `bottom` ou `drawer`.
 *   - `fundo-nenhum` / `fundo-linear` / `fundo-linear-45` / `fundo-radial` / `fundo-mesh`: `bgGradientMode` (e o ângulo).
 *   - `material-<frosted|sleek|industrial|organic>`: `surfaceMaterial`, com intensidade alta para o efeito aparecer.
 *   - `sombra-neutra` / `sombra-colorida` / `sombra-ambiente`: `shadowColorMode` sobre uma primária vermelha e um fundo claro,
 *     para a cor da sombra se distinguir do preto.
 *   - `sombra-dura`: a geometria da sombra do cartão (`cardShadow*`) em sombra dura deslocada.
 *   - `tom-neutro` / `tom-cyber` / `tom-tatico`: `systemTone`.
 *   - `tema-claro`: modo claro com fundo e cartão brancos e cor de textura escura.
 *   - `atomo-switch-assimetrico` / `atomo-switch-pulso`: `switchStyleType` (o vidro é `atomo-glass`).
 *   - `moldura-<solid|cyber|double|glow|none>`: `borderType`, sobre uma cor de textura escura distinta da primária.
 *   - `orientacao-<bottom|center|top|diagonal|dinamica>`: `shadowOrientation` (diagonal = `bottom-right`).
 *   - `camadas-zero` / `camadas-dobro`: `layeredShadows` 0 e 2 (o padrão é 1).
 *   - `vidro-cartao` / `vidro-cartao-fosco`: `cardBackdropBlur` = 24 (o padrão é 12), sob o material `sleek` e sob o `frosted` padrão.
 *   - `cor-profunda` / `cor-variada`: `colorDepth` e `colorVariation` altos, sobre uma primária de matiz médio.
 *   - `dono-raio-mestre` / `dono-raio-canto`: o raio mestre do cartão (20) e do botão (30) sozinho, e com um canto declarado
 *     (`cardRadiusTL` e `btnRadiusTR` = 0). O padrão do canto é 8/12/12 e 6/8/8: com o mestre em outro valor, só o mestre chega.
 *   - `dono-mestre-escalar` / `dono-mestre-escalar-canto-responsivo` / `dono-mestre-responsivo-canto-escalar`: o raio mestre do cartão
 *     (20 ou 10/14/18) e do botão (30 ou 12/16/20) em formato escalar ou responsivo, com o canto (`cardRadiusTL`, `btnRadiusTR`)
 *     declarado no outro formato (2/4/6 e 1/3/5 responsivos; 3 e 4 escalares) — o canto é de formato diferente do mestre.
 *   - `dono-superficie`: `surfaceColor` e `cardBackgroundColor` diferentes — cada um com a própria variável.
 *   - `dono-raio-sistema`: `borderRadius` (5) e `cardBorderRadius` (20) diferentes — cada um com a própria variável.
 *   - `cascata-raio-catalogo`: `catalogSectionRadius` = 1rem (o padrão é 3rem), a seção do catálogo que o componente leu.
 *   - `legivel-claro` / `legivel-escuro`: modo claro (corpo e cartão brancos) com primária e status CLAROS, e modo escuro com
 *     primária e status ESCUROS — o texto sobre a cor sólida tem de inverter (escuro sobre o claro, claro sobre o escuro).
 *   - `componente-botao`: `btnPrimaryBg`/`btnPrimaryText`/`btnSecondaryBg` em três cores distintas e distintas da primária;
 *     `componente-botao-neon`: o secundário sob o estilo neon (que escreve o fundo por `style`).
 *   - `componente-sombra`: `cardShadow` declarada (a sombra dura vermelha); `componente-superficie`: `cardSurfaceOpacity` 0,5.
 *   - `componente-brilho`: `cardHoverStyle` = `glow-only`; `componente-tabela`: os três tokens de cor da tabela em cores
 *     conhecidas; `componente-duracao`: `motionDurationNormal` = 0,9 s.
 *   - `schema-cartao`, `schema-campos`, `schema-atmosfera`, `schema-movimento`, `schema-ruido`, `schema-sem-suavizacao`:
 *     o recorte "alterado" de cada grupo da `plan-113` (o padrão é a mesma cena sem `?tema=`).
 */
const TOKEN_VARIANTS: Record<string, Record<string, unknown>> = {
    'borda-tracejada': { borderStyle: 'dashed' },
    'botao-cantos': { btnBorderRadius: 0, btnRadiusTL: 9999, btnRadiusTR: 9999, btnRadiusBR: 9999, btnRadiusBL: 9999 },
    'respiro-responsivo': { layoutPadding: { mob: 16, tab: 24, desk: 32 } },
    'respiro-compacto': { layoutPadding: { mob: 5, tab: 10, desk: 15 } },
    'cromo-cor': { topbarColor: '#16566f' },
    'cromo-gap': { tabGap: 23 },
    'cromo-margem': { tabSectionMargin: 23 },
    'cromo-estrutura': { isNavHidden: true },
    'cromo-largura-limitada': { maxContentWidth: '1000px' },
    'cromo-largura-fluida': { maxContentWidth: '100%' },
    'cromo-densidade-compacta': { layoutDensity: 'compact' },
    'cromo-densidade-confortavel': { layoutDensity: 'comfortable' },
    'cromo-densidade-espacosa': { layoutDensity: 'spacious' },
    'cromo-vista-dividida': { isSplitViewEnabled: true },
    'atomo-frosted': { btnStyleType: 'frosted' },
    'atomo-neumorphism': { inputShadow: 'neumorphism' },
    'atomo-glass': { switchStyleType: 'glass' },
    'atomo-switch-assimetrico': { switchStyleType: 'asymmetric' },
    'atomo-switch-pulso': { switchStyleType: 'pulsing' },
    'fundo-nenhum': { bgGradientMode: 'none' },
    'fundo-linear': { bgGradientMode: 'linear', bgGradientAngle: 90 },
    'fundo-linear-45': { bgGradientMode: 'linear', bgGradientAngle: 45 },
    'fundo-radial': { bgGradientMode: 'radial' },
    'fundo-mesh': { bgGradientMode: 'mesh' },
    'material-frosted': { surfaceMaterial: 'frosted', surfaceIntensity: 0.9 },
    'material-sleek': { surfaceMaterial: 'sleek', surfaceIntensity: 0.9 },
    'material-industrial': { surfaceMaterial: 'industrial', surfaceIntensity: 0.9 },
    'material-organic': { surfaceMaterial: 'organic', surfaceIntensity: 0.9 },
    'sombra-neutra': { shadowColorMode: 'neutral', primaryColor: '#e11d48', colorBgBody: '#d6dbe6' },
    'sombra-colorida': { shadowColorMode: 'colored', primaryColor: '#e11d48', colorBgBody: '#d6dbe6' },
    'sombra-ambiente': { shadowColorMode: 'ambient', primaryColor: '#e11d48', colorBgBody: '#d6dbe6' },
    'sombra-dura': { cardShadowOffsetX: 8, cardShadowOffsetY: 8, cardShadowBlur: 0, cardShadowExpansion: 0 },
    'tom-neutro': { systemTone: 'none' },
    'tom-cyber': { systemTone: 'cyber' },
    'tom-tatico': { systemTone: 'tactical' },
    'moldura-solid': { borderType: 'solid', textureColor: '#1f2937' },
    'moldura-cyber': { borderType: 'cyber', textureColor: '#1f2937' },
    'moldura-double': { borderType: 'double', textureColor: '#1f2937' },
    'moldura-glow': { borderType: 'glow', textureColor: '#1f2937' },
    'moldura-none': { borderType: 'none', textureColor: '#1f2937' },
    'orientacao-bottom': { shadowOrientation: 'bottom' },
    'orientacao-center': { shadowOrientation: 'center' },
    'orientacao-top': { shadowOrientation: 'top' },
    'orientacao-diagonal': { shadowOrientation: 'bottom-right' },
    'orientacao-dinamica': { shadowOrientation: 'dynamic' },
    'camadas-zero': { layeredShadows: 0 },
    'camadas-dobro': { layeredShadows: 2 },
    'vidro-cartao': { cardBackdropBlur: 24, surfaceMaterial: 'sleek' },
    'vidro-cartao-fosco': { cardBackdropBlur: 24 },
    'cor-profunda': { primaryColor: '#808040', colorDepth: 3 },
    'cor-variada': { primaryColor: '#808040', colorVariation: 5 },
    'cor-base': { primaryColor: '#808040' },
    'tema-claro': { mode: 'light', colorBgBody: '#ffffff', cardBackgroundColor: '#ffffff', textureColor: '#1f2937' },
    'toque-alvo-largo': { touchTargetMin: 56 },
    'corpo-pequeno': { bodySize: '12px' },
    'movimento-reduzido': { reducedMotion: true },
    'navegacao-celular-base': { mobileNavigationStyle: 'bottom' },
    'navegacao-celular-gaveta': { mobileNavigationStyle: 'drawer' },
    'schema-cartao': {
        cardHeaderBg: '#ff0000', cardHeaderBorder: '#00ff00', cardHeaderPadding: 20,
        cardFooterBg: '#0000ff', cardFooterBorder: '#ffff00',
        cardHoverTranslate: -10, cardHoverGlowIncrease: 0.5,
        cardActionBtnPrimaryBg: '#ff0000', cardActionBtnText: '#00ff00', cardActionBtnBorderRadius: 20, cardActionBtnPadding: 24,
        cardSearchBgFocus: '#ff0000', cardSearchTextFocusColor: '#00ff00', cardSearchPlaceholderColor: '#0000ff',
    },
    'schema-campos': {
        inputPadding: 24, tooltipRadius: 12, modalOverlayBlur: 20, colorBgModal: '#ff0000',
        tableZebraStriping: true, tableBorderRadius: 0, statusGlowBlur: 12,
        identityPadding: 24, identityFontWeight: 300, identityTracking: 0.2, identityFontFamily: 'Georgia, serif',
    },
    'schema-tokens-cor': { tooltipBg: '#ff0000', tooltipTextColor: '#00ff00', tooltipBorderColor: '#0000ff', modalOverlayColor: 'rgba(255, 0, 0, 0.5)' },
    'schema-hover-expand': { cardHoverStyle: 'expand' },
    'schema-hover-brilho': { cardHoverStyle: 'glow-only' },
    'schema-atmosfera': { bgGradientMode: 'mesh', colorBgLayer2: '#ff0000' },
    'schema-movimento': { motionDurationNormal: 0.7, motionDurationInstant: 0.2 },
    'cascata-raio-catalogo': { catalogSectionRadius: 1 },
    'legivel-claro': { mode: 'light', colorBgBody: '#ffffff', cardBackgroundColor: '#ffffff', textColorMaster: '#0f172a', primaryColor: '#ffeb3b', secondaryColor: '#fff176', statusErrorColor: '#fde047', statusSuccessColor: '#10b981' },
    'legivel-escuro': { mode: 'dark', colorBgBody: '#050505', cardBackgroundColor: '#0f172a', textColorMaster: '#ffffff', primaryColor: '#1a237e', secondaryColor: '#311b92', statusErrorColor: '#101830', statusSuccessColor: '#10b981' },
    'componente-botao': { btnPrimaryBg: 'rgb(255, 0, 0)', btnPrimaryText: 'rgb(0, 255, 0)', btnSecondaryBg: 'rgb(0, 0, 255)' },
    'componente-botao-neon': { btnStyleType: 'neon', btnSecondaryBg: 'rgb(0, 0, 255)' },
    'componente-sombra': { cardShadow: '10px 10px 0px 0px rgb(255, 0, 0)' },
    'componente-superficie': { cardSurfaceOpacity: 0.5 },
    'componente-brilho': { cardHoverStyle: 'glow-only' },
    'componente-tabela': { tableHeaderBg: 'rgb(1, 2, 3)', tableRowHoverBg: 'rgb(4, 5, 6)', tableBorderColor: 'rgb(7, 8, 9)' },
    'componente-duracao': { motionDurationNormal: 0.9 },
    'dono-raio-mestre': { cardBorderRadius: { mob: 20, tab: 20, desk: 20 }, btnBorderRadius: { mob: 30, tab: 30, desk: 30 } },
    'dono-raio-canto': {
        cardBorderRadius: { mob: 20, tab: 20, desk: 20 }, cardRadiusTL: { mob: 0, tab: 0, desk: 0 },
        btnBorderRadius: { mob: 30, tab: 30, desk: 30 }, btnRadiusTR: { mob: 0, tab: 0, desk: 0 },
    },
    'recorte-geometrico': { cardGeometricCut: 20 },
    'identidade-esquerda': { identityAlignment: 'left' },
    'identidade-centro': { identityAlignment: 'center' },
    'identidade-direita': { identityAlignment: 'right' },
    'identidade-hover-nenhum': { identityHoverEffect: 'none' },
    'identidade-hover-opacidade': { identityHoverEffect: 'opacity' },
    'identidade-hover-escala': { identityHoverEffect: 'scale' },
    'identidade-hover-brilho': { identityHoverEffect: 'glow' },
    'vidro-rugoso': { glassRoughness: 0.5, glassSpecularity: 0.4 },
    'vinheta-suave': { vignetteSoftness: 60, texture: 'noise' },
    'vinheta-seca': { vignetteSoftness: 0, texture: 'noise' },
    'vinheta-padrao': { texture: 'noise' },
    'sidebar-camada': { zIndexSidebar: 300 },
    'selo-quadrado': { badgeRadius: 4 },
    'peso-leve': { h2Weight: '300', bodyWeight: '300', headingTransform: 'uppercase' },
    'botao-neumorphism': { btnStyleType: 'neumorphism' },
    'movimento-padrao': { motionDurationFast: 0.45, motionEaseMain: 'cubic-bezier(0.1, 0.7, 0.1, 1)' },
    'moldura-dupla': { borderType: 'double', textureColor: '#1f2937' },
    'dono-mestre-escalar': { cardBorderRadius: 20, btnBorderRadius: 30 },
    'dono-mestre-escalar-canto-responsivo': {
        cardBorderRadius: 20, cardRadiusTL: { mob: 2, tab: 4, desk: 6 },
        btnBorderRadius: 30, btnRadiusTR: { mob: 1, tab: 3, desk: 5 },
    },
    'dono-mestre-responsivo-canto-escalar': {
        cardBorderRadius: { mob: 10, tab: 14, desk: 18 }, cardRadiusTL: 3,
        btnBorderRadius: { mob: 12, tab: 16, desk: 20 }, btnRadiusTR: 4,
    },
    'dono-superficie': { surfaceColor: '#123456', cardBackgroundColor: '#654321' },
    'contraste-claro': { mode: 'light', colorBgBody: '#ffffff', cardBackgroundColor: '#ffffff', textColorMaster: '#0f172a', titleColor: '#0f172a', textColorMuted: '#475569', primaryColor: '#22d3ee', statusErrorColor: '#fca5a5', statusSuccessColor: '#86efac', statusWarningColor: '#fde047', btnGhostHoverBg: 'rgba(15, 23, 42, 0.05)', reducedMotion: true },
    'contraste-escuro': { mode: 'dark', colorBgBody: '#050505', cardBackgroundColor: '#0f172a', textColorMaster: '#ffffff', primaryColor: '#1e3a8a', statusErrorColor: '#7f1d1d', statusSuccessColor: '#14532d', statusWarningColor: '#78350f', btnGhostHoverBg: 'rgba(255, 255, 255, 0.05)', reducedMotion: true },
    'contraste-cyberpunk-claro': { mode: 'light', colorBgBody: '#ffffff', cardBackgroundColor: '#ffffff', textColorMaster: '#0f172a', primaryColor: '#0e7490', statusErrorColor: '#b91c1c', statusSuccessColor: '#047857', btnStyleType: 'cyberpunk', reducedMotion: true },
    'contraste-cyberpunk-escuro': { mode: 'dark', colorBgBody: '#050505', cardBackgroundColor: '#0f172a', textColorMaster: '#ffffff', primaryColor: '#22d3ee', statusErrorColor: '#f87171', statusSuccessColor: '#34d399', btnStyleType: 'cyberpunk', reducedMotion: true },
    'fixos-movimento': { switchStyleType: 'pulsing', motionDurationSlow: 0.9, matrixRadius: 3 },
    'fixos-pulso-padrao': { switchStyleType: 'pulsing' },
    'titulo-proprio': { titleColor: 'rgb(255, 0, 0)', topbarTitleColor: 'rgb(0, 255, 0)', textColorMaster: 'rgb(0, 0, 255)' },
    'sobreposicao-direcao': { shadowOrientation: 'top' },
    'modo-claro': { mode: 'light' },
    'modo-escuro': { mode: 'dark' },
    'dono-raio-sistema': { borderRadius: { mob: 5, tab: 5, desk: 5 }, cardBorderRadius: { mob: 20, tab: 20, desk: 20 } },
    'schema-ruido': { texture: 'noise', bgNoiseAnimation: 2 },
    'cartao-spotlight-zero': { cardSpotlightOpacity: 0 },
    'cartao-spotlight-forte': { cardSpotlightOpacity: 1 },
    'cartao-clique-forte': { cardActionClickScale: 0.8 },
    'cartao-clique-nenhum': { cardActionClickScale: 1 },
    'cartao-zoom-forte': { imageCardHoverZoom: 1.5 },
    'cartao-zoom-nenhum': { imageCardHoverZoom: 1 },
    'schema-sem-suavizacao': { textSmoothing: false },
};

function resolveHarnessConfig(): Record<string, unknown> {
    const variant = TOKEN_VARIANTS[searchParams.get('tema') ?? ''] ?? {};
    if (hasGlobalBackground) return { ...variant, globalBackgroundImageUrl: 'https://harness.local/bg.png' };
    return variant;
}

/**
 * `SarakButton` de REFERÊNCIA, na mesma página: o teste compara o computado do item de
 * navegação contra o computado deste botão real, em vez de embutir valores em px
 * calculados à mão — a métrica de botão de ação é o que a regressão da ADR-013 fez o
 * item de menu herdar, então é ela que serve de contraprova ao vivo.
 */
/**
 * Elementos de PROVA de que a classe utilitária vence o padrão de ELEMENTO da lib — e de
 * que, sem classe, o padrão continua valendo. HTML nativo de propósito: a regra medida
 * mira o elemento (`button`, `span`), e um átomo traria classes próprias que confundiriam
 * a medição. Só usam classes que o `dist/sarak.css` já emite: o `@source` do build varre
 * `src/`, não esta fixture, e uma classe inventada aqui não existiria no CSS medido. E
 * nenhum NOME de classe de prova contém `card` nem `border` fora do caso de borda: a lib
 * tem regras `[class*="card"]`/`[class*="border"]` que casam pelo nome da classe.
 */
const ElementDefaultProbes: React.FC = () => (
    <div>
        <button type="button" className="rounded-full">Prova raio por classe</button>
        <button type="button" className="hover:bg-rose-500">Prova hover por classe</button>
        <button type="button">Prova hover sem classe</button>
        <span className="font-mono">Prova família por classe</span>
        <span>Prova família sem classe</span>
        <h2 className="font-mono">Prova título por classe</h2>
        <h2>Prova título sem classe</h2>
        <div className="border border-dashed">Prova borda por classe</div>
        <div className="border">Prova borda pelo token</div>
    </div>
);

const App: React.FC = () => {
    const chrome = (
        <SarakAppChrome
            navItems={NAV_ITEMS}
            brand={{ name: 'Harness' }}
            className="sarak-chrome-root"
            navigationStyle={navigationStyle}
            style={embeddedStyle}
            secondaryContent={(
                <div data-harness-secondary-content style={{ minHeight: '2400px' }}>
                    Painel secundário longo
                </div>
            )}
        >
            <SarakButton>Referência</SarakButton>
            <ElementDefaultProbes />
            <div data-harness-long-content style={{ minHeight: '2400px' }}>Conteúdo longo</div>
        </SarakAppChrome>
    );

    return (
        <SarakUIProvider config={resolveHarnessConfig()}>
            {hostWidth ? (
                <div data-harness-host style={{ width: hostWidth, height: '100dvh' }}>
                    {chrome}
                </div>
            ) : chrome}
        </SarakUIProvider>
    );
};

/**
 * `?cena=<nome>` troca a página inteira por uma cena de prova de CSS que o cromo não exercita.
 * Sem o parâmetro vale o `App` acima, intocado. Cada cena só usa classes que o
 * `dist/sarak.css` já emite.
 *   - `textura`: cartão real da lib e um elemento com utilitária de fundo cujo NOME contém
 *     `card`, sob a textura que o tema default já liga no `body`.
 *   - `sem-provider`: botões nativos SEM `SarakUIProvider` — só o `dist/sarak.css` e o HTML.
 *   - `atomos`: os átomos de formulário e botão que escrevem estilo inline.
 *   - `select-grade`: `SarakSelect` sem e com `fullWidth`, cada um numa célula de grade que estica.
 *   - `painel`: um botão que monta o painel de customização carregado sob demanda.
 *   - `calendario`: o `SarakCalendar` em dois contêineres, um largo e um estreito, para medir a
 *     container query dele (ponto × título) e o texto do chip.
 *   - `gantt`: o `SarakGantt` com 30 tarefas e 8 dependências (uma para tarefa inexistente), na escala de dia
 *     num contêiner largo e na de semana num estreito. As datas partem de hoje, para o marcador de hoje existir.
 *   - `gantt-altura`: as mesmas tarefas em dois hosts de ALTURA definida (1000 × 420 e 340 × 360).
 *   - `gantt-intervalo`: o `SarakGantt` com `rangeStart`/`rangeEnd` de 20 dias (escala de dia, host de 600 px) e
 *     tarefas antes do intervalo, cruzando cada borda, dentro e depois dele, com setas para as de fora.
 *   - `calendario-tom`: o calendário com um evento de tom fora da união (`neutral`, como vem de dado solto)
 *     ao lado de um evento `primary`.
 *   - `toque`: acionáveis e campos da lib, o calendário e o Gantt num contêiner largo — a cena em que se mede o
 *     alvo de toque e o corpo da fonte dos campos com ponteiro de dedo.
 *   - `toque-estreito`: o calendário e o Gantt num contêiner de 320 px (WCAG 1.4.10).
 *   - `movimento`: um elemento com transição e outro com animação longas, para medir o movimento reduzido.
 *   - `navegacao-celular`: o cromo com 4 destinos e um conteúdo mais alto que a janela, cujo último item é
 *     `data-probe="ultimo-item"` — a cena em que se mede a barra da base no celular.
 *   - `navegacao-celular-7`: o mesmo cromo com 7 destinos, acima do teto de 5 da barra em `auto`.
 *   - `alternadores`: dois `SarakSwitch`, um desligado e um ligado — a cena em que se mede o estilo do alternador.
 *   - `texturas-claras`: um cartão por textura de cartão que desenhava em branco fixo, cada um sob o atributo
 *     `data-sx-card-texture-type` da própria textura — a cena em que se mede a cor delas em superfície clara.
 *   - `texturas-cor`: uma textura por família de leitor da cor de textura (gradiente, máscara de SVG, tecido) e um
 *     elemento `glow-reveal` (a animação que lê a mesma cor).
 *   - `busca`: a paleta `SarakSearch` aberta, cujo painel lê `--dynamic-shadow`.
 *   - `componente`: o que o componente lê do token — o botão primário e o secundário, um `.sarak-card` puro, com
 *     classe de fundo e com classe de fundo no hover, um contêiner `.card` com classe de fundo, um cartão interativo,
 *     a tabela e um alternador.
 *   - `cartao-movimento`: um `SarakActionCard`, um `SarakTitleCard`, um `SarakSearchCard` e um `SarakImageCard` lado a lado, cada um
 *     em `data-probe` próprio — a cena em que se mede o spotlight que segue o cursor, o aperto do botão de ação e o zoom da imagem
 *     sob o ponteiro (`?tema=cartao-*`).
 *   - `legivel`: o que o componente desenha sobre a cor sólida e sobre a superfície do tema — badge sólido (primário, perigo)
 *     e suave (sucesso), botão de perigo, abas em pílula (a bandeja de tinta) e o alternador da barra de prova.
 * `?css=escopado` troca o `sarak.css` global pelo `sarak-scoped.css` (o artefato do Modo Embarcado, com `:root` virado em
 * `.sarak-scope`) antes de montar a cena; sem ele a folha é a global.
 *
 *   - `identidade-<esquerda|centro|direita>` / `identidade-hover-<nenhum|opacidade|escala|brilho>`: `identityAlignment` e
 *     `identityHoverEffect`, medidos no nome da marca do cromo (`.sarak-chrome-brand`).
 *   - `vidro-rugoso`: `glassRoughness` 0,5 e `glassSpecularity` 0,4, medidos num `.sarak-glass` (cena `cartao-cede`).
 *   - `vinheta-<suave|seca|padrao>`: `vignetteSoftness` 60, 0 e o padrão (sobre a textura `noise`, que liga a vinheta); `sidebar-camada`: `zIndexSidebar` 300; `selo-quadrado`: `badgeRadius` 4.
 *   - `peso-leve`: `h2Weight` 300, `bodyWeight` 300 e `headingTransform` uppercase; `botao-neumorphism`: `btnStyleType`.
 *
 *   - `contraste-<claro|escuro>`: primária e status que, usados CRUS como texto, reprovam sobre a tinta de 10% (claros no claro, escuros
 *     no escuro); `contraste-cyberpunk-<claro|escuro>`: o mesmo com `btnStyleType` cyberpunk; `modo-claro` / `modo-escuro`: só o `mode`.
 *   - `contraste-botoes`: botões fantasma, contorno, primário, perigo e sucesso e o botão de sair do usuário; `contraste-auth`: a tela de
 *     autenticação com erro (`?v=aviso` troca para o aviso) — as cenas em que se mede o texto sobre a tinta e sobre o fundo transparente.
 *   - `valores-fixos`: o alternador pulsante (`?tema=fixos-movimento`: `motionDurationSlow` 0,9 e `matrixRadius` 3), o filtro, o botão
 *     de ajuda e a matriz expansível — a cena em que se mede o que deixou de ser valor fixo.
 *   - `cartao-cede`: o cartão da lib (`.sarak-card`) com e sem classe utilitária de fundo, desfoque, moldura, preenchimento e
 *     sombra, o `.bg-theme-card` só como cor, e um botão com transform inline — a cena em que o material, a moldura, a caixa e o
 *     aperto do botão cedem à classe e ao `style`.
 *   - `lightbox`: o `SarakLightbox` aberto e um elemento do HOSPEDEIRO com `text-white` — a cena do sequestro do modo claro.
 *   - `transicao`: elementos com `transition-colors` (sem duração) e com `duration-[var(--sarak-motion-dur-normal,0.3s)]` (duração própria) — a cena em que o padrão
 *     das transições do Tailwind vem do token de movimento.
 *   - `cascata`: o que o motor entrega por padrão e o que o componente decide — `SarakCatalogGrid` (a seção é `.card`
 *     com `rounded-[var(--sarak-catalog-section-radius)]`), um `.sarak-card` nativo (puro, com `rounded-full`) e um
 *     contêiner `.card` sem classe, o `SarakKanban` (fundo por `style` inline em `<section>`/`<article>`) e
 *     um `<section>` solto sem fundo, para a contraprova de que o padrão transparente continua.
 */
const SCENE_ITEM = { nome: 'Cartão de prova' };
const SCENE_MAPPING = { title: 'nome' };

const TextureScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <SarakTitleCard item={SCENE_ITEM} mapping={SCENE_MAPPING} />
        <div data-probe="utilitaria-com-card-no-nome" className="bg-[var(--sarak-card-bg)]">
            Utilitária com card no nome
        </div>
    </div>
);

const NoProviderScene: React.FC = () => (
    <div>
        <button type="button">Prova hover sem Provider</button>
        <div data-probe="cartao-sem-provider" style={{ background: 'var(--theme-card)' }}>Cartão sem Provider</div>
    </div>
);

const AtomsScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="botao"><SarakButton>Botão de prova</SarakButton></div>
        <div data-probe="campo"><SarakInput aria-label="Campo de prova" /></div>
        <div data-probe="alternador"><SarakSwitch aria-label="Alternador de prova" /></div>
        <div data-probe="intervalo"><SarakRangeSlider label="Intervalo de prova" /></div>
        <div data-probe="acordeao"><SarakAccordion title="Acordeão de prova" defaultOpen>Conteúdo</SarakAccordion></div>
    </div>
);

const GRID_CELL_STYLE: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr', width: '600px' };

const SelectGridScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="select-sem-largura-total" style={GRID_CELL_STYLE}>
            <SarakSelect aria-label="Seletor sem largura total"><option>Curto</option></SarakSelect>
        </div>
        <div data-probe="select-largura-total" style={GRID_CELL_STYLE}>
            <SarakSelect fullWidth aria-label="Seletor com largura total"><option>Curto</option></SarakSelect>
        </div>
    </div>
);

const PanelScene: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div style={{ height: '100dvh' }}>
            <button type="button" onClick={() => setIsOpen(true)}>Abrir painel</button>
            {isOpen && <div style={{ height: '80dvh' }}><SarakCustomizationPanel /></div>}
        </div>
    );
};

const CALENDAR_MONTH = new Date(2026, 9, 1);
const CALENDAR_EVENTS = [
    { id: 'sprint', title: 'Sprint review longo', start: '2026-10-07', end: '2026-10-09' },
    { id: 'entrega', title: 'Entrega', start: '2026-10-14', tone: 'success' as const },
];

const CalendarScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="calendario-largo" style={{ width: '1000px' }}>
            <SarakCalendar events={CALENDAR_EVENTS} defaultMonth={CALENDAR_MONTH} />
        </div>
        <div data-probe="calendario-estreito" style={{ width: '340px' }}>
            <SarakCalendar events={CALENDAR_EVENTS} defaultMonth={CALENDAR_MONTH} />
        </div>
    </div>
);

const GANTT_TODAY = new Date();
const ganttDay = (offset: number): Date =>
    new Date(GANTT_TODAY.getFullYear(), GANTT_TODAY.getMonth(), GANTT_TODAY.getDate() + offset);
const GANTT_TONES = ['primary', 'success', 'warning', 'danger', 'info', 'muted'] as const;
// `t0` dura 3 dias; `t1`..`t7` dependem da anterior (7 setas); `t9` depende de uma tarefa que não existe.
const GANTT_TASKS = Array.from({ length: 30 }, (_, index) => ({
    id: `t${index}`,
    title: `Tarefa ${index}`,
    start: ganttDay(index - 5),
    end: ganttDay(index - 3),
    progress: (index * 7) % 101,
    tone: GANTT_TONES[index % GANTT_TONES.length],
    group: `Fase ${Math.floor(index / 10) + 1}`,
    dependsOn: index >= 1 && index <= 7 ? [`t${index - 1}`] : index === 9 ? ['tarefa-inexistente'] : undefined,
}));

const GanttScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="gantt-largo" style={{ width: '1000px' }}>
            <SarakGantt tasks={GANTT_TASKS} scale="day" />
        </div>
        <div data-probe="gantt-estreito" style={{ width: '340px' }}>
            <SarakGantt tasks={GANTT_TASKS} scale="week" />
        </div>
    </div>
);

const GanttHeightScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="gantt-host-largo" style={{ width: '1000px', height: '420px' }}>
            <SarakGantt tasks={GANTT_TASKS} scale="day" />
        </div>
        <div data-probe="gantt-host-estreito" style={{ width: '340px', height: '360px' }}>
            <SarakGantt tasks={GANTT_TASKS} scale="week" />
        </div>
    </div>
);

// O tom chega como dado solto (JSON de uma API, por exemplo): fora da união que o tipo descreve.
const LOOSE_TONE = JSON.parse('"neutral"') as 'primary';
const CALENDAR_TONE_EVENTS = [
    { id: 'sem-tom', title: 'Tom desconhecido', start: '2026-10-07', tone: LOOSE_TONE },
    { id: 'primario', title: 'Tom primário', start: '2026-10-14', tone: 'primary' as const },
];

const CalendarToneScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="calendario-tom" style={{ width: '1000px' }}>
            <SarakCalendar events={CALENDAR_TONE_EVENTS} defaultMonth={CALENDAR_MONTH} />
        </div>
    </div>
);

// `antes` e `depois` ficam inteiras fora do intervalo; `cruza-*` atravessam uma borda cada; as duas setas têm uma ponta fora.
const GANTT_RANGE_TASKS = [
    { id: 'antes', title: 'Antes', start: ganttDay(-10), end: ganttDay(-5) },
    { id: 'cruza-inicio', title: 'Cruza o início', start: ganttDay(-3), end: ganttDay(2) },
    { id: 'dentro', title: 'Dentro', start: ganttDay(5), end: ganttDay(7), dependsOn: ['antes'] },
    { id: 'cruza-fim', title: 'Cruza o fim', start: ganttDay(17), end: ganttDay(24) },
    { id: 'depois', title: 'Depois', start: ganttDay(25), end: ganttDay(40), dependsOn: ['dentro'] },
];

const GanttRangeScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="gantt-intervalo" style={{ width: '600px' }}>
            <SarakGantt tasks={GANTT_RANGE_TASKS} scale="day" rangeStart={ganttDay(0)} rangeEnd={ganttDay(19)} />
        </div>
    </div>
);

const TOUCH_TASKS = GANTT_TASKS.slice(0, 6);

const TouchScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="acionaveis" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-start' }}>
            <SarakButton size="xs">Botão xs</SarakButton>
            <SarakButton size="sm" variant="secondary">Botão sm</SarakButton>
            <SarakButton size="md" variant="ghost">Botão md</SarakButton>
            <SarakIconButton size="xs" aria-label="Ícone xs" icon={<span aria-hidden="true">+</span>} />
            <SarakIconButton size="sm" variant="ghost" aria-label="Ícone sm" icon={<span aria-hidden="true">+</span>} />
            <SarakMenuItem label="Item vertical" orientation="vertical" />
            <SarakMenuItem label="Item horizontal" orientation="horizontal" />
            <SarakMenuItem label="Item recolhido" collapsed icon={<span aria-hidden="true">+</span>} />
        </div>
        <div data-probe="campos" style={{ display: 'grid', gap: '8px', width: '320px' }}>
            <SarakInput aria-label="Campo de texto" />
            <SarakSelect aria-label="Campo de seleção"><option>Opção</option></SarakSelect>
            <SarakTextarea aria-label="Campo de texto longo" />
            <SarakTimePicker label="Horário" />
        </div>
        <div data-probe="calendario" style={{ width: '800px' }}>
            <SarakCalendar events={CALENDAR_EVENTS} defaultMonth={CALENDAR_MONTH} />
        </div>
        <div data-probe="gantt" style={{ width: '800px' }}>
            <SarakGantt tasks={TOUCH_TASKS} scale="day" />
        </div>
    </div>
);

const NarrowTouchScene: React.FC = () => (
    <div style={{ padding: 0 }}>
        <div data-probe="calendario-320" style={{ width: '320px' }}>
            <SarakCalendar events={CALENDAR_EVENTS} defaultMonth={CALENDAR_MONTH} />
        </div>
        <div data-probe="gantt-320" style={{ width: '320px' }}>
            <SarakGantt tasks={GANTT_TASKS} scale="week" />
        </div>
    </div>
);

const MotionScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="transicao" style={{ transition: 'opacity 5s linear', opacity: 1 }}>Transição longa</div>
        <div data-probe="animacao" className="animate-spin">Animação longa</div>
    </div>
);

const MOBILE_NAV_ITEMS = ['Início', 'Pedidos', 'Contas', 'Ajustes', 'Relatórios', 'Equipe', 'Ajuda'].map((label, index) => ({
    id: `destino-${index + 1}`,
    label,
    href: `/destino-${index + 1}`,
    icon: 'Home',
    active: index === 1,
}));

const MobileNavigationScene: React.FC<{ itemCount: number }> = ({ itemCount }) => (
    <SarakAppChrome
        navItems={MOBILE_NAV_ITEMS.slice(0, itemCount)}
        brand={{ name: 'Harness' }}
        widgets={{ user: false, notifications: false }}
    >
        <div style={{ height: '2400px' }}>Conteúdo mais alto que a janela</div>
        <p data-probe="ultimo-item">Último item do conteúdo</p>
    </SarakAppChrome>
);

const SwitchesScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="alternador-desligado"><SarakSwitch aria-label="Alternador desligado" /></div>
        <div data-probe="alternador-ligado"><SarakSwitch checked readOnly aria-label="Alternador ligado" /></div>
    </div>
);

const FIXED_WHITE_TEXTURES = ['brushed', 'frosted', 'topo-deep', 'prism-mesh', 'blueprint-pro', 'wave-pulse'] as const;

const LightTexturesScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        {FIXED_WHITE_TEXTURES.map((texture) => (
            <div key={texture} data-probe={`textura-${texture}`} data-sx-card-texture-type={texture}>
                <SarakTitleCard item={{ nome: texture }} mapping={SCENE_MAPPING} />
            </div>
        ))}
    </div>
);

const COLORED_TEXTURES = ['stripes', 'waves', 'carbon'] as const;

/** Uma textura por família de leitor (gradiente, máscara de SVG, tecido) e o `glow-reveal` das animações. */
const TextureColorScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        {COLORED_TEXTURES.map((texture) => (
            <div key={texture} data-probe={`textura-${texture}`} data-sx-card-texture-type={texture}>
                <SarakTitleCard item={{ nome: texture }} mapping={SCENE_MAPPING} />
            </div>
        ))}
        <div data-probe="brilho-animado" className="glow-reveal" style={{ width: '40px', height: '40px' }} />
    </div>
);

const NOOP = (): void => undefined;

/** A paleta de busca aberta: o painel dela lê `--dynamic-shadow`. */
const SearchScene: React.FC = () => (
    <div data-probe="busca">
        <SarakSearch isOpen onClose={NOOP} items={[{ id: 'inicio', label: 'Início' }]} />
    </div>
);

const PIXEL_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/** Os quatro cartões que movem (spotlight, aperto do botão de ação, zoom da imagem), com tamanho fixo para o ponteiro cair onde se quer. */
const CardMotionScene: React.FC = () => (
    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 360px)', gap: '24px' }}>
        <div data-probe="cartao-acao"><SarakActionCard item={{ nome: 'Ação' }} mapping={{ title: 'nome' }} /></div>
        <div data-probe="cartao-titulo"><SarakTitleCard item={{ nome: 'Título' }} mapping={SCENE_MAPPING} /></div>
        <div data-probe="cartao-busca"><SarakSearchCard item={{ nome: 'Busca' }} mapping={SCENE_MAPPING} /></div>
        <div data-probe="cartao-imagem" style={{ height: '200px', display: 'flex' }}>
            <SarakImageCard src={PIXEL_GIF} title="Imagem" className="flex-1" />
        </div>
    </div>
);

const SCHEMA_ROWS = [{ nome: 'Ana' }, { nome: 'Bia' }, { nome: 'Caio' }];

/** Uma peça de cada token da `plan-113`; o recorte (`?tema=schema-*`) é o que muda, a cena é a mesma. */
const SchemaScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="cartao-interativo"><SarakCard interactive>Cartão clicável</SarakCard></div>
        <div data-probe="cartao">
            <SarakCard>
                <SarakCard.Header>Cabeçalho</SarakCard.Header>
                <SarakCard.Body>Corpo</SarakCard.Body>
                <SarakCard.Footer>Rodapé</SarakCard.Footer>
            </SarakCard>
        </div>
        <div data-probe="acao"><SarakActionCard item={{ nome: 'Ação' }} mapping={{ title: 'nome' }} /></div>
        <div data-probe="busca-cartao"><SarakSearchCard item={{}} /></div>
        <div data-probe="campo-fora"><SarakInput placeholder="fora do cartão" /></div>
        <div data-probe="badge"><SarakBadge variant="danger">Falha</SarakBadge></div>
        <div data-probe="ghost"><SarakButton variant="ghost">Fantasma</SarakButton></div>
        <div data-probe="tooltip"><SarakTooltip content="Dica"><button type="button">Alvo</button></SarakTooltip></div>
        <div data-probe="tabela">
            <SarakTable data={SCHEMA_ROWS} columns={[{ key: 'nome', label: 'Nome' }]} responsive={false} />
        </div>
    </div>
);

/** O diálogo aberto, sozinho: o véu dele intercepta o ponteiro, então não divide cena com as sondas de hover. */
const SchemaModalScene: React.FC = () => (
    <SarakModal isOpen onClose={() => undefined} title="Diálogo">Conteúdo do diálogo</SarakModal>
);

const CASCADE_CATALOG_ITEMS = [{ id: 'item-a', display_name: 'Item A', organization: 'Organização', category: 'a' }];
const CASCADE_KANBAN_COLUMNS = [{ id: 'fazer', title: 'A fazer', cards: [{ id: 'c1', title: 'Cartão do quadro' }] }];

const CascadeScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="catalogo"><SarakCatalogGrid title="Catálogo de prova" items={CASCADE_CATALOG_ITEMS} /></div>
        <div data-probe="cartao-puro"><div className="sarak-card">Cartão puro</div></div>
        <div data-probe="botao"><SarakButton>Botão de prova</SarakButton></div>
        <div data-probe="cartao-raio-por-classe"><div className="sarak-card rounded-full">Cartão com raio por classe</div></div>
        <div data-probe="cartao-conteiner"><div className="card">Contêiner sem classe de raio</div></div>
        <div data-probe="kanban">
            <SarakKanban columns={CASCADE_KANBAN_COLUMNS} />
        </div>
        <div data-probe="secao-solta"><section>Seção sem fundo próprio</section></div>
    </div>
);

/** A classe de fundo e a de fundo no hover existem no `dist/sarak.css`: o Tailwind só gera o que os fontes da lib citam. */
const ComponentScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="botao-primario"><SarakButton>Primário</SarakButton></div>
        <div data-probe="botao-secundario"><SarakButton variant="secondary">Secundário</SarakButton></div>
        <div data-probe="cartao-puro"><div className="sarak-card">Cartão puro</div></div>
        <div data-probe="cartao-classe-fundo"><div className="sarak-card bg-[var(--color-theme-card,rgba(15,23,42,0.6))]">Cartão com fundo por classe</div></div>
        <div data-probe="cartao-classe-hover"><div className="sarak-card hover:bg-[var(--sarak-btn-primary-bg,#00f2ff)]">Cartão com fundo no hover</div></div>
        <div data-probe="cartao-borda-hover"><div className="sarak-card hover:border-[color-mix(in_srgb,var(--sarak-primary-color,#00f2ff)_30%,transparent)]">Cartão com borda no hover</div></div>
        <div data-probe="conteiner-classe-fundo"><div className="card bg-[var(--color-theme-card,rgba(15,23,42,0.6))]">Contêiner com fundo por classe</div></div>
        <div data-probe="cartao-interativo"><SarakCard interactive>Cartão interativo</SarakCard></div>
        <div data-probe="tabela"><SarakTable data={SCHEMA_ROWS} columns={[{ key: 'nome', label: 'Nome' }]} responsive={false} /></div>
        <div data-probe="alternador"><SarakSwitch aria-label="Alternador de prova" /></div>
    </div>
);

const MATERIAL_IMAGES = [{ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', alt: 'Pixel' }, { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', alt: 'Pixel 2' }];

/** Só usa classes que o `dist/sarak.css` emite: o Tailwind gera o que os fontes da lib citam. */
const CardYieldsScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="cartao-puro"><div className="sarak-card">Cartão puro</div></div>
        <div data-probe="cartao-gradiente"><div className="sarak-card bg-gradient-to-r from-[var(--sarak-secondary-color,#7000ff)] to-[var(--sarak-status-info-color,#3b82f6)]">Gradiente por classe</div></div>
        <div data-probe="cartao-desfoque"><div className="sarak-card backdrop-blur-sm">Desfoque por classe</div></div>
        <div data-probe="cartao-moldura"><div className="sarak-card border-dashed">Moldura por classe</div></div>
        <div data-probe="cartao-preenchimento"><div className="sarak-card p-8">Preenchimento por classe</div></div>
        <div data-probe="referencia-p8"><div className="p-8">A mesma classe, fora do cartão</div></div>
        <div data-probe="cartao-sem-preenchimento"><div className="sarak-card p-0">Sem preenchimento</div></div>
        <div data-probe="cartao-sem-sombra"><div className="sarak-card shadow-none">Sem sombra por classe</div></div>
        <div data-probe="cartao-posicao" style={{ position: 'relative', height: '40px' }}>
            <div className="sarak-card absolute" style={{ pointerEvents: 'none' }}>Posição por classe</div>
        </div>
        <div data-probe="so-cor"><div className="bg-theme-card">Só a cor do cartão</div></div>
        <div data-probe="vidro"><div className="sarak-glass">Vidro de prova</div></div>
        <div data-probe="botao-livre"><button type="button">Botão sem estilo</button></div>
        <div data-probe="botao-inline"><button type="button" style={{ transform: 'scale(0.5)' }}>Botão com transform</button></div>
    </div>
);

const LightboxScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <span data-probe="hospedeiro" className="text-white">Texto do hospedeiro</span>
        <SarakLightbox images={MATERIAL_IMAGES} isOpen onClose={NOOP} />
    </div>
);

const TransitionScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="sem-duracao" className="transition-colors">Transição sem duração</div>
        <div data-probe="com-duracao" className="transition-all duration-[var(--sarak-motion-dur-normal,0.3s)]">Transição com duração</div>
        <button data-probe="botao-sem-duracao" type="button" className="transition-colors">Botão sem duração</button>
    </div>
);

const LEGIBLE_TABS = [{ id: 'a', label: 'Primeira' }, { id: 'b', label: 'Segunda' }];

const LegibleScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="badge-solido-primario"><SarakBadge variant="primary" soft={false}>Primário</SarakBadge></div>
        <div data-probe="badge-solido-perigo"><SarakBadge variant="danger" soft={false}>Perigo</SarakBadge></div>
        <div data-probe="badge-suave-sucesso"><SarakBadge variant="success">Sucesso</SarakBadge></div>
        <div data-probe="botao-perigo"><SarakButton variant="danger">Excluir</SarakButton></div>
        <div data-probe="abas"><SarakTabs variant="pills" tabs={LEGIBLE_TABS} activeTab="a" onChange={NOOP} /></div>
    </div>
);

/** Os botões e o botão de sair do usuário, nos estados em que o texto senta sobre uma tinta ou sobre o fundo transparente. */
const ContrastButtonsScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="fantasma"><SarakButton variant="ghost">Fantasma</SarakButton></div>
        <div data-probe="contorno"><SarakButton variant="outline">Contorno</SarakButton></div>
        <div data-probe="primario"><SarakButton variant="primary">Primário</SarakButton></div>
        <div data-probe="perigo"><SarakButton variant="danger">Perigo</SarakButton></div>
        <div data-probe="sucesso"><SarakButton variant="success">Sucesso</SarakButton></div>
        <div data-probe="sair"><SarakShellUserWidget variant="horizontal" user={{ name: 'Ana' }} logout={NOOP} /></div>
    </div>
);

/** O aviso (`?v=aviso`) ou o erro de autenticação, sobre a própria tinta a 10%. */
const ContrastAuthScene: React.FC = () => (
    <div data-probe="auth">
        <SarakAuthScreen error="Mensagem de prova" errorVariant={searchParams.get('v') === 'aviso' ? 'warning' : 'error'} />
    </div>
);

/** O que tinha valor fixo e agora lê o token: pulso do alternador, raio e sombra da matriz, texto do filtro e da ajuda. */
const MATRIX_ROLES = [{ id: 'papel', name: 'Papel de prova' }];
const MATRIX_PERMISSIONS = [{ id: 'permissao', name: 'Permissão de prova' }];

const FixedValuesScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="pulso"><SarakSwitch checked onChange={NOOP} aria-label="Alternador pulsante" /></div>
        <div data-probe="filtro"><SarakFilterSelect col="a" filters={{}} onChange={NOOP} options={['A', 'B']} /></div>
        <div data-probe="ajuda"><SarakHelpButton text="Texto de ajuda de prova" /></div>
        <div data-probe="matriz">
            <SarakExpandableMatrix data={MATRIX_ROLES} subItems={MATRIX_PERMISSIONS} activeMapping={() => true} onToggle={NOOP} />
        </div>
    </div>
);

/**
 * O resíduo da re-auditoria: o que o CSS da lib faz com a classe do host e com o escopo do rascunho.
 *   - `residuo`: transição por classe, `rounded-btn` × `rounded-xl`, `bg-theme-body` de componente × contêiner de página,
 *     título do tema, tooltip, popup de ajuda e a tela com Provider; `?bg=1` liga a mídia de fundo.
 *   - `escopo-rascunho`: o mesmo par de utilitárias DENTRO e FORA de um `SarakDesignScope` com outro rascunho.
 *   - `desmontar`: o Provider monta e desmonta por botão; o que o injetor escreveu no `html`/`body` tem de sair com ele.
 */
const ResidueScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="transicao-padrao" className="transition-sarak">Transição por classe do sistema</div>
        <div data-probe="transicao-classe" className="transition-sarak duration-[var(--sarak-motion-dur-slow,0.6s)]">Com duração própria</div>
        <div data-probe="raio-sistema"><SarakButton>Raio do botão</SarakButton></div>
        <div data-probe="raio-classe"><SarakButton className="rounded-xl">Raio da classe</SarakButton></div>
        <div data-probe="raio-referencia" className="rounded-xl">O mesmo rounded-xl, fora do botão</div>
        <div data-probe="fundo-componente" className="bg-theme-body">Fundo de componente</div>
        <div data-probe="fundo-pagina" className="sarak-page-surface bg-theme-body">Fundo de página</div>
        <h2 data-probe="titulo" className="text-theme-title">Título do tema</h2>
        <div data-probe="dica"><SarakTooltip content="Dica de prova"><button type="button">Alvo da dica</button></SarakTooltip></div>
        <div data-probe="ajuda"><SarakHelpButton text="Texto de ajuda de prova" /></div>
        <div data-probe="sombra-tema" style={{ boxShadow: 'var(--dynamic-shadow)' }}>Sombra do tema</div>
    </div>
);

const SCOPE_DRAFT = { ...sarakGetDefaultDesignState(), mode: 'dark', primaryColor: 'rgb(255, 0, 0)', btnBorderRadius: 30, motionDurationFast: 0.9 };

const DraftScopeScene: React.FC = () => (
    <div style={{ padding: '16px' }}>
        <div data-probe="fora">
            <button data-probe="fora-raio" type="button" className="rounded-btn">Fora</button>
            <div data-probe="fora-cor" className="bg-theme-primary">Cor fora</div>
            <div data-probe="fora-duracao" style={{ transitionDuration: 'var(--duration-fast)' }}>Duração fora</div>
        </div>
        <div data-probe="dentro">
            <SarakDesignScope design={SCOPE_DRAFT as never}>
                <button data-probe="dentro-raio" type="button" className="rounded-btn">Dentro</button>
                <div data-probe="dentro-cor" className="bg-theme-primary">Cor dentro</div>
                <div data-probe="dentro-duracao" style={{ transitionDuration: 'var(--duration-fast)' }}>Duração dentro</div>
            </SarakDesignScope>
        </div>
    </div>
);

/** A vinheta (atmosfera decorativa) e uma notificação aberta: a notificação tem de ficar por cima. */
const AtmosphereScene: React.FC = () => {
    const toast = useToast();
    React.useEffect(() => { toast.notify({ message: 'Notificação de prova' }); }, []);
    return (
        <div style={{ padding: '16px' }}>
            <div data-probe="vinheta" className="sarak-vignette-layer" />
            <span data-probe="conteudo">Conteúdo sob a vinheta</span>
        </div>
    );
};

const UnmountScene: React.FC = () => {
    const [mounted, setMounted] = React.useState(true);
    return (
        <div>
            <button type="button" data-probe="desmontar" onClick={() => setMounted(false)}>Desmontar o Provider</button>
            {mounted && (
                <SarakUIProvider config={{ mode: 'light', globalBackgroundImageUrl: 'https://harness.local/bg.png' }}>
                    <span data-probe="dentro-provider">Dentro do Provider</span>
                </SarakUIProvider>
            )}
        </div>
    );
};

const MobileNavigationFewScene: React.FC = () => <MobileNavigationScene itemCount={4} />;
const MobileNavigationManyScene: React.FC = () => <MobileNavigationScene itemCount={7} />;

const SCENES: Record<string, React.FC> = {
    'navegacao-celular': MobileNavigationFewScene,
    'navegacao-celular-7': MobileNavigationManyScene,
    toque: TouchScene,
    'toque-estreito': NarrowTouchScene,
    movimento: MotionScene,
    textura: TextureScene,
    'sem-provider': NoProviderScene,
    desmontar: UnmountScene,
    atmosfera: AtmosphereScene,
    atomos: AtomsScene,
    'select-grade': SelectGridScene,
    painel: PanelScene,
    calendario: CalendarScene,
    gantt: GanttScene,
    'gantt-altura': GanttHeightScene,
    'gantt-intervalo': GanttRangeScene,
    'calendario-tom': CalendarToneScene,
    alternadores: SwitchesScene,
    'texturas-claras': LightTexturesScene,
    'texturas-cor': TextureColorScene,
    busca: SearchScene,
    schema: SchemaScene,
    cascata: CascadeScene,
    componente: ComponentScene,
    legivel: LegibleScene,
    'contraste-botoes': ContrastButtonsScene,
    'valores-fixos': FixedValuesScene,
    residuo: ResidueScene,
    'escopo-rascunho': DraftScopeScene,
    'contraste-auth': ContrastAuthScene,
    'cartao-cede': CardYieldsScene,
    lightbox: LightboxScene,
    transicao: TransitionScene,
    'schema-modal': SchemaModalScene,
    'cartao-movimento': CardMotionScene,
};

/**
 * `?tema=dono-*` vira um TEMA ATIVO do consumidor com só os tokens do recorte. O tema vence a `config`,
 * então é o caminho em que o canto do raio "não declarado" de um tema chega à tela.
 */
function ownerThemeFromParams(): { id: string; name: string; design: Record<string, unknown> } | undefined {
    const name = searchParams.get('tema') ?? '';
    if (!name.startsWith('dono-')) return undefined;
    return { id: 'tema-de-prova', name: 'Tema de prova', design: { mode: 'dark', ...TOKEN_VARIANTS[name] } };
}

function renderScene(Scene: React.FC): React.ReactElement {
    if (searchParams.get('cena') === 'sem-provider' || searchParams.get('cena') === 'desmontar') return <Scene />;
    // `?tema-ativo=<id>` liga um tema de referência inteiro (ex.: `minimalist-airy`, claro); ausente, nada muda.
    const activeThemeId = searchParams.get('tema-ativo') ?? undefined;
    // `?modo=embarcado` liga o Modo Embarcado: as variáveis vão para a ilha, e o CSS responsivo para `.sarak-scope`.
    const options = searchParams.get('modo') === 'embarcado' ? { mode: 'embedded' as const } : undefined;
    const ownerTheme = ownerThemeFromParams();
    if (ownerTheme) {
        return <SarakUIProvider config={{ mode: 'dark' }} customThemes={[ownerTheme]} activeThemeId={ownerTheme.id} options={options}><Scene /></SarakUIProvider>;
    }
    return <SarakUIProvider config={resolveHarnessConfig()} activeThemeId={activeThemeId} options={options}><Scene /></SarakUIProvider>;
}

/**
 * `?cena=troca-de-tema`: o `activeThemeId` do Provider muda em tempo de execução. O tema A declara o raio mestre e o canto
 * escalares (os dois vão inline); o B declara os dois responsivos (vão ao `<style>`) — o inline do A é o que não pode ficar.
 */
const SWITCH_THEMES = [
    { id: 'tema-a', name: 'Tema A', design: { mode: 'dark' as const, cardBorderRadius: 20, cardRadiusTL: 3, btnBorderRadius: 30, btnRadiusTR: 4 } },
    {
        id: 'tema-b',
        name: 'Tema B',
        design: {
            mode: 'dark' as const,
            cardBorderRadius: { mob: 10, tab: 14, desk: 18 },
            cardRadiusTL: { mob: 2, tab: 4, desk: 6 },
            btnBorderRadius: { mob: 12, tab: 16, desk: 20 },
            btnRadiusTR: { mob: 1, tab: 3, desk: 5 },
        },
    },
];

const ThemeSwitchScene: React.FC = () => {
    const [activeThemeId, setActiveThemeId] = React.useState('tema-a');
    const options = searchParams.get('modo') === 'embarcado' ? { mode: 'embedded' as const } : undefined;
    return (
        <SarakUIProvider config={{ mode: 'dark' }} customThemes={SWITCH_THEMES} activeThemeId={activeThemeId} options={options}>
            <button type="button" data-probe="trocar" onClick={() => setActiveThemeId('tema-b')}>Trocar de tema</button>
            <CascadeScene />
        </SarakUIProvider>
    );
};

/**
 * `?cena=tema-sob-demanda`: o tema embarcado chega sob demanda e a tela nunca mostra um tema errado.
 *   - `?pedido=<id>`: `initialTheme` forçado por código (um tema embarcado que NÃO está no boot).
 *   - `?controlado=1`: o pedido vira `activeThemeId` (controlado) em vez de `initialTheme`.
 *   - `?alvo=<id>`: o botão `data-probe="escolher"` troca o `activeThemeId` para ele em tempo de execução.
 * Um gravador de quadros (`window.__frames`) anota, a CADA animation frame desde antes do primeiro render, se a
 * aplicação já está na página (`appPresent`), a cor da primária que ela mostra (`color`) e se o fallback está na tela.
 */
interface ThemeFrame { appPresent: boolean; color: string; fallback: boolean }
declare global { interface Window { __frames?: ThemeFrame[] } }

function startFrameRecorder(): void {
    window.__frames = [];
    const tick = (): void => {
        const probe = document.querySelector('[data-probe="cor-do-tema"]');
        window.__frames?.push({
            appPresent: probe !== null,
            color: probe ? getComputedStyle(probe).backgroundColor : '',
            fallback: document.querySelector('[data-probe="fallback"]') !== null,
        });
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

const OnDemandThemeScene: React.FC = () => {
    const requested = searchParams.get('pedido') ?? undefined;
    const target = searchParams.get('alvo') ?? undefined;
    const controlled = searchParams.get('controlado') === '1';
    const [activeThemeId, setActiveThemeId] = React.useState<string | undefined>(controlled ? requested : undefined);
    return (
        <SarakUIProvider
            initialTheme={controlled ? undefined : requested}
            activeThemeId={activeThemeId}
            loadingFallback={<div data-probe="fallback">carregando tema</div>}
        >
            <div data-probe="cor-do-tema" style={{ width: 40, height: 40, backgroundColor: 'var(--color-theme-primary, #00f2ff)' }} />
            {target ? <button type="button" data-probe="escolher" onClick={() => setActiveThemeId(target)}>Escolher</button> : null}
        </SarakUIProvider>
    );
};

const SceneComponent = SCENES[searchParams.get('cena') ?? ''];

const container = document.getElementById('root');
if (!container) throw new Error('harness-entry: #root ausente no HTML do harness.');
/** `?css=escopado`: usa a folha do Modo Embarcado e espera ela carregar, para a cena nascer já com ela. */
async function swapToScopedStylesheet(): Promise<void> {
    if (searchParams.get('css') !== 'escopado') return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]');
    if (!link) return;
    await new Promise<void>((resolve) => {
        link.addEventListener('load', () => resolve(), { once: true });
        link.addEventListener('error', () => resolve(), { once: true });
        link.href = './sarak-scoped.css';
    });
}

void swapToScopedStylesheet().then(() => {
    if (searchParams.get('cena') === 'tema-sob-demanda') {
        startFrameRecorder();
        createRoot(container).render(<OnDemandThemeScene />);
    } else if (searchParams.get('cena') === 'troca-de-tema') {
        createRoot(container).render(<ThemeSwitchScene />);
    } else {
        createRoot(container).render(SceneComponent ? renderScene(SceneComponent) : <App />);
    }
});
