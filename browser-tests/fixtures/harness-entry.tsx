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
    SarakAccordion,
    SarakAppChrome,
    SarakButton,
    SarakCalendar,
    SarakGantt,
    SarakCustomizationPanel,
    SarakIconButton,
    SarakInput,
    SarakMenuItem,
    SarakRangeSlider,
    SarakSearch,
    SarakSelect,
    SarakSwitch,
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
};

function renderScene(Scene: React.FC): React.ReactElement {
    if (searchParams.get('cena') === 'sem-provider') return <Scene />;
    // `?tema-ativo=<id>` liga um tema de referência inteiro (ex.: `minimalist-airy`, claro); ausente, nada muda.
    const activeThemeId = searchParams.get('tema-ativo') ?? undefined;
    return <SarakUIProvider config={resolveHarnessConfig()} activeThemeId={activeThemeId}><Scene /></SarakUIProvider>;
}

const SceneComponent = SCENES[searchParams.get('cena') ?? ''];

const container = document.getElementById('root');
if (!container) throw new Error('harness-entry: #root ausente no HTML do harness.');
createRoot(container).render(SceneComponent ? renderScene(SceneComponent) : <App />);
