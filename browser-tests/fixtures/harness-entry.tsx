/**
 * Ponto de entrada do harness de medição de CSS renderizado (browser-tests/README.md).
 *
 * Renderiza o CROMO PÚBLICO de verdade (`SarakUIProvider` + `SarakAppChrome`) contra o
 * pacote PUBLICADO (`@sarak/lib-ui-core`, resolvido para `dist/index.js` via alias do
 * bundler do harness — ver `build-harness.mjs`) — não um mock, não uma reimplementação
 * das classes. O que o navegador calcula aqui é exatamente o que um consumidor real
 * recebe, porque é o mesmo artefato (`dist/`) que o consumidor instala.
 *
 * Um único conjunto NOMEADO de itens de navegação, com `id`/`href`/`label` estáveis —
 * o teste (`cromo-css-real.spec.ts`) mira neles por `getByRole('button', { name })`,
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
];

const searchParams = new URLSearchParams(window.location.search);
const hasGlobalBackground = searchParams.get('bg') === '1';

/**
 * `?tema=<nome>` troca a `config` do Provider por um recorte de tokens nomeado — o mesmo
 * App, para medir um valor de token que o tema default não exercita.
 *   - `borda-tracejada`: `borderStyle` = `dashed`, o valor que a ponte do token leva a
 *     todo elemento com classe de borda.
 *   - `botao-cantos`: raio mestre 0 e os quatro cantos em 9999 (o desenho do
 *     `minimalist-airy`). Com mestre igual aos cantos, o caso não distinguiria nada.
 */
const TOKEN_VARIANTS: Record<string, Record<string, unknown>> = {
    'borda-tracejada': { borderStyle: 'dashed' },
    'botao-cantos': { btnBorderRadius: 0, btnRadiusTL: 9999, btnRadiusTR: 9999, btnRadiusBR: 9999, btnRadiusBL: 9999 },
};

function resolveHarnessConfig(): Record<string, unknown> {
    if (hasGlobalBackground) return { globalBackgroundImageUrl: 'https://harness.local/bg.png' };
    return TOKEN_VARIANTS[searchParams.get('tema') ?? ''] ?? {};
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
        <SarakAppChrome navItems={NAV_ITEMS} brand={{ name: 'Harness' }} className="sarak-chrome-root">
            <SarakButton>Referência</SarakButton>
            <ElementDefaultProbes />
        </SarakAppChrome>
    </SarakUIProvider>
);

const container = document.getElementById('root');
if (!container) throw new Error('harness-entry: #root ausente no HTML do harness.');
createRoot(container).render(<App />);
