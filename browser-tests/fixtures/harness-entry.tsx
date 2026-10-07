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
import { SarakUIProvider, SarakAppChrome, SarakButton } from '@sarak/lib-ui-core';

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

const App: React.FC = () => (
    <SarakUIProvider config={resolveHarnessConfig()}>
        <SarakAppChrome
            navItems={NAV_ITEMS}
            brand={{ name: 'Harness' }}
            className="sarak-chrome-root"
            navigationStyle={navigationStyle}
            style={embeddedStyle}
        >
            <SarakButton>Referência</SarakButton>
            <ElementDefaultProbes />
            <div data-harness-long-content style={{ minHeight: '2400px' }}>Conteúdo longo</div>
        </SarakAppChrome>
    </SarakUIProvider>
);

const container = document.getElementById('root');
if (!container) throw new Error('harness-entry: #root ausente no HTML do harness.');
createRoot(container).render(<App />);
