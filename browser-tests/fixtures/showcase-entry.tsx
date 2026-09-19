/**
 * Ponto de entrada da VITRINE de temas — captura visual do catálogo shippado para
 * aprovação do dono, tema × modo × orientação.
 *
 * Renderiza o cromo público (`SarakUIProvider` + `SarakAppChrome`) contra o pacote
 * PUBLICADO (`@sarak/lib-ui-core`, alias para `dist/index.js` — ver
 * `build-harness.mjs`), com uma amostra de conteúdo (card, tabela, botões, campos
 * e tipografia), para o script gerador (`generate-showcase.mts`) capturar uma
 * imagem por tema × modo × orientação e o dono comparar o catálogo inteiro.
 *
 * `?tema=<id>` — qualquer id de `GLOBAL_THEMES`; `?modo=light|dark` — aplicado
 * como PREFERÊNCIA (`updatePreferences({ colorMode })`), o mesmo caminho do
 * `ShellThemeToggle` real (specs/specs/09-temas-e-presets.md §4.3, a "porta que a
 * documentação recomenda ao importador" — nunca `resolveThemeForMode` direto, que
 * não é superfície pública); `?nav=sidebar|topbar` — sobrepõe `navigationStyle` no
 * `config` de semente do Provider, porque a preferência de navegação não é
 * OFERECIDA por padrão de fábrica em nenhum tema hoje (specs/specs/09 §4.7) e por
 * isso não teria efeito se pedida como preferência.
 *
 * O item de navegação ativo é sempre "Início"; o script hover-eia "Relatórios"
 * antes de capturar, para uma única imagem mostrar as duas cores de realce
 * (ativo e hover) ao mesmo tempo.
 *
 * Card e tabela usam a prop `data` (array já em mãos, sem `endpoint`) — as duas
 * aceitam dado direto, sem chamada de rede. A amostra também inclui `SarakBadge`
 * em todas as variantes, `muted` inclusive (o que ficava ilegível em temas de
 * borda sólida antes do conserto do badge).
 */
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
    SarakUIProvider,
    SarakAppChrome,
    SarakButton,
    SarakBadge,
    SarakInput,
    SarakSelect,
    SarakSwitch,
    SarakTypography,
    SarakTable,
    SarakCardGrid,
    useSarakPreferences,
} from '@sarak/lib-ui-core';

const params = new URLSearchParams(window.location.search);
const temaId = params.get('tema') ?? undefined;
const modo = params.get('modo') === 'light' ? 'light' : 'dark';
const nav = params.get('nav') === 'topbar' ? 'topbar' : 'sidebar';

const NAV_ITEMS = [
    { id: 'inicio', label: 'Início', href: '/inicio', active: true },
    { id: 'relatorios', label: 'Relatórios', href: '/relatorios' },
    { id: 'config', label: 'Configurações', href: '/config' },
];

const CARD_ITEMS = [
    { titulo: 'Cartão Um', subtitulo: 'Categoria A', descricao: 'Texto de exemplo do card.', badge: 'Ativo' },
    { titulo: 'Cartão Dois', subtitulo: 'Categoria B', descricao: 'Outro texto de exemplo.', badge: 'Pendente' },
];

const TABLE_ITEMS = [
    { nome: 'Item Um', status: 'Ativo', valor: 'R$ 120,00' },
    { nome: 'Item Dois', status: 'Pendente', valor: 'R$ 80,00' },
    { nome: 'Item Três', status: 'Inativo', valor: 'R$ 45,00' },
];

const BADGE_VARIANTS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'muted'] as const;

/** Aplica a preferência de MODO pela mesma porta pública que `ShellThemeToggle` usa. */
const PreferencesDriver: React.FC<{ colorMode: 'light' | 'dark' }> = ({ colorMode }) => {
    const { updatePreferences } = useSarakPreferences();
    useEffect(() => {
        updatePreferences({ colorMode });
    }, [colorMode, updatePreferences]);
    return null;
};

const ShowcaseContent: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, maxWidth: 960 }}>
        <section>
            <SarakTypography variant="h1">Título de vitrine</SarakTypography>
            <SarakTypography variant="h2">Subtítulo de seção</SarakTypography>
            <SarakTypography variant="body">
                Texto corrido de exemplo, para avaliar a família tipográfica do corpo em cada tema.
            </SarakTypography>
            <SarakTypography variant="caption" color="muted">Legenda em cor muted.</SarakTypography>
        </section>

        <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <SarakButton variant="primary">Primário</SarakButton>
            <SarakButton variant="secondary">Secundário</SarakButton>
            <SarakButton variant="outline">Contorno</SarakButton>
            <SarakButton variant="ghost">Fantasma</SarakButton>
            <SarakButton variant="danger">Perigo</SarakButton>
            <SarakButton variant="success">Sucesso</SarakButton>
        </section>

        <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <SarakInput label="Campo de texto" placeholder="Digite algo" style={{ minWidth: 220 }} />
            <SarakSelect defaultValue="a" style={{ minWidth: 160 }}>
                <option value="a">Opção A</option>
                <option value="b">Opção B</option>
            </SarakSelect>
            <SarakSwitch label="Ativar recurso" defaultChecked />
        </section>

        <section style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {BADGE_VARIANTS.map((variant) => (
                <SarakBadge key={`${variant}-soft`} variant={variant}>{variant}</SarakBadge>
            ))}
            {BADGE_VARIANTS.map((variant) => (
                <SarakBadge key={`${variant}-solid`} variant={variant} soft={false}>{variant}</SarakBadge>
            ))}
        </section>

        <section>
            <SarakCardGrid
                data={CARD_ITEMS}
                label="Cartões de exemplo"
                mapping={{ title: 'titulo', subtitle: 'subtitulo', description: 'descricao', badge: 'badge' }}
            />
        </section>

        <section>
            <SarakTable
                data={TABLE_ITEMS}
                label="Tabela de exemplo"
                mapping={{ nome: 'Nome', status: 'Status', valor: 'Valor' }}
            />
        </section>
    </div>
);

const App: React.FC = () => (
    <SarakUIProvider initialTheme={temaId} config={{ navigationStyle: nav }}>
        <PreferencesDriver colorMode={modo} />
        <SarakAppChrome navItems={NAV_ITEMS} brand={{ name: 'Vitrine' }} className="sarak-chrome-root">
            <ShowcaseContent />
        </SarakAppChrome>
    </SarakUIProvider>
);

const container = document.getElementById('root');
if (!container) throw new Error('showcase-entry: #root ausente no HTML do harness.');
createRoot(container).render(<App />);
