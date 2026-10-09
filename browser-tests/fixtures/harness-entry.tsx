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
    SarakInput,
    SarakRangeSlider,
    SarakSelect,
    SarakSwitch,
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
 *   - `calendario-tom`: o calendário com um evento de tom fora da união (`neutral`, como vem de dado solto)
 *     ao lado de um evento `primary`.
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

const SCENES: Record<string, React.FC> = {
    textura: TextureScene,
    'sem-provider': NoProviderScene,
    atomos: AtomsScene,
    'select-grade': SelectGridScene,
    painel: PanelScene,
    calendario: CalendarScene,
    gantt: GanttScene,
    'gantt-altura': GanttHeightScene,
    'calendario-tom': CalendarToneScene,
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
