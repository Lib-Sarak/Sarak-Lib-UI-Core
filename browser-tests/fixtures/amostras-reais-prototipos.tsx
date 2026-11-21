/**
 * Protótipos das amostras do painel com o componente real (lote 1 da plan-166). Vivem só no harness: nada do produto muda.
 * Cada protótipo monta o mesmo `OptionTile`/`SampleScope`/`LazyWhenVisible` do painel, trocando só o que a amostra desenha.
 */
import React, { Suspense, useMemo } from 'react';
import { SarakDeviceProvider } from '../../src/core/Provider/DeviceProvider';
import { SarakAppChrome, type SarakNavItem } from '../../src/components/Layout/SarakAppChrome';
import { SarakTitleCard } from '../../src/components/atomic/Cards/SarakTitleCard';
import { SarakBadge } from '../../src/components/atomic/Feedback/SarakBadge';
import { SarakEmptyState } from '../../src/components/atomic/Feedback/SarakEmptyState';
import { SarakProgress } from '../../src/components/atomic/Feedback/SarakProgress';
import { SarakDataTable, type SarakColumn } from '../../src/components/atomic/DataDisplay/SarakDataTable';
import { SarakChartEngine } from '../../src/components/engines/charts';
import { useDesignVariables } from '../../src/core/Design/hooks/useDesignVariables';
import { DesignOverrideContext } from '../../src/core/Provider/SarakUIProvider';
import { SarakStyle } from '../../src/core/Provider/components/SarakStyle';
import { resolveThemeForMode } from '../../src/core/Design/presets/themes/color-engine';
import { withThemePalette } from '../../src/core/Design/presets/themes/compose';
import type { SarakThemePreset } from '../../src/core/Design/presets/themes';
import type { SarakTokenValue } from '../../src/core/Design/types';
import type { SarakDesignState } from '../../src/core/Provider/types';
import type { ComponentPreset } from '../../src/core/Design/presets/components/cards';
import { MockDashboard } from '../../src/features/DesignEngine/Canvas/Mocks/DashboardMock';
import { OptionTile } from '../../src/features/DesignEngine/Canvas/components/OptionTile';
import { LazyWhenVisible } from '../../src/features/DesignEngine/Canvas/components/LazyWhenVisible';
import { SampleScope } from '../../src/features/DesignEngine/Canvas/components/SampleScope';
import { BAR_WIDGETS_OFF } from '../../src/features/DesignEngine/Canvas/components/PresetGroupCatalog';
import { MINIATURE_STILL_CSS } from '../../src/features/DesignEngine/Canvas/components/PresetCard';
import { SAMPLE_TEXTURE_STYLE } from '../../src/features/DesignEngine/Canvas/components/SampleParts';

const noop = (): void => undefined;
export type Mode = 'light' | 'dark';

/** O quadro de referência da miniatura de tema com a tela "Painel": o tamanho em que o sistema é desenhado antes de a opção o reduzir. */
export const PROTO_THEME_FRAME = { width: 1024, height: 576 } as const;
/** O quadro de referência da amostra de card com a anatomia real (título, conteúdo e ação). */
export const PROTO_CARD_FRAME = { width: 300, height: 240 } as const;

const NAV: SarakNavItem[] = [
    { id: 'home', label: 'Início', href: '#home', icon: 'Home' },
    { id: 'sales', label: 'Vendas', href: '#sales', icon: 'Briefcase' },
    { id: 'orders', label: 'Pedidos', href: '#orders', icon: 'FileText', active: true },
];

/** O escopo enxuto da miniatura (as variáveis do tema e o contexto de design), o mesmo de `PresetCard.tsx`. */
export const MiniatureScope: React.FC<{ design: SarakDesignState; children: React.ReactNode }> = ({ design, children }) => {
    const { variables, attributes } = useDesignVariables(design as unknown as Record<string, unknown>);
    return (
        <DesignOverrideContext.Provider value={design}>
            <div className={`sarak-design-scope sarak-theme-miniature ${design.mode || 'dark'}`} style={{ width: '100%', height: '100%', ...variables, color: 'var(--sarak-text-main)', backgroundColor: 'var(--sarak-bg-base)', position: 'relative' }} {...attributes}>
                {children}
            </div>
        </DesignOverrideContext.Provider>
    );
};

/** A miniatura de tema com a tela "Painel" INTEIRA (a opção que o produto não adotou: passou do teto de 2× em parte das rodadas), dentro do cromo real. */
const ProtoThemeMiniature: React.FC<{ theme: SarakThemePreset; currentMode: Mode }> = React.memo(({ theme, currentMode }) => {
    const design = useMemo(() => ({
        ...BAR_WIDGETS_OFF,
        ...withThemePalette(resolveThemeForMode({ design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, currentMode)),
        globalBackgroundImageUrl: undefined,
    }) as unknown as SarakDesignState, [theme.design, theme.contraparte, currentMode]);
    return (
        <MiniatureScope design={design}>
            <SarakDeviceProvider overrideDevice="desktop">
            <div data-testid="theme-miniature" style={{ width: PROTO_THEME_FRAME.width, height: PROTO_THEME_FRAME.height, transform: 'translateZ(0)' }}>
                <SarakAppChrome brand={{ name: 'Marca' }} navItems={NAV} user={{ name: 'Usuário' }} logout={noop} onNavigate={noop} style={{ height: '100%' }}>
                    <div style={{ height: '100%', overflow: 'hidden' }}><MockDashboard tokens={design} inheritVariables /></div>
                </SarakAppChrome>
            </div>
            </SarakDeviceProvider>
        </MiniatureScope>
    );
});
ProtoThemeMiniature.displayName = 'ProtoThemeMiniature';

export const ProtoThemeTile: React.FC<{ theme: SarakThemePreset; currentMode: Mode }> = ({ theme, currentMode }) => (
    <OptionTile name={theme.name} description={theme.description} onApply={noop} peekTokens={() => null} frameWidth={PROTO_THEME_FRAME.width} frameHeight={PROTO_THEME_FRAME.height} buttonProps={{ 'data-theme-id': theme.id }}>
        <LazyWhenVisible className="h-full"><ProtoThemeMiniature theme={theme} currentMode={currentMode} /></LazyWhenVisible>
    </OptionTile>
);

export const ProtoStillCss: React.FC = () => <SarakStyle dangerouslySetInnerHTML={{ __html: MINIATURE_STILL_CSS }} />;

const CARD_ITEM = { title: 'CPU Cluster', subtitle: 'Node-04-PR', context: '42000', input_caps: ['Vision', 'Chat'] };
const CARD_MAPPING = { title: 'title', subtitle: 'subtitle', context: 'context', input_caps: 'input_caps', icon: 'Cpu' };

/** O card real do painel ("CPU Cluster": chip de título, conteúdo e ação), com a textura do card quando há. */
const ProtoCard: React.FC<{ design: SarakDesignState }> = ({ design }) => (
    <div className="w-full"><SarakTitleCard item={CARD_ITEM} mapping={CARD_MAPPING} design={design as never} /></div>
);

/** A textura do fundo aplicada de verdade ao escopo da amostra, sem card por cima (o dono preferiu assim). */
const ProtoBackgroundOnly: React.FC = () => <div aria-hidden="true" className="h-full w-full" />;

const TABLE_COLUMNS: Array<SarakColumn<unknown>> = [
    { id: 'name', header: 'Módulo', width: 110 },
    { id: 'load', header: 'Carga', width: 70, align: 'right' },
    { id: 'status', header: 'Status', width: 90, render: (row) => <SarakBadge variant="success" soft pill>{(row as { status: string }).status}</SarakBadge> },
];
const TABLE_ROWS = [{ id: '1', name: 'Scraper', load: '14%', status: 'Online' }, { id: '2', name: 'Parser', load: '0%', status: 'Idle' }, { id: '3', name: 'Auth', load: '45%', status: 'Online' }, { id: '4', name: 'Webhook', load: '92%', status: 'Warn' }];
const CHART_DATA = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'].map((name, index) => ({ name, value: [4, 7, 5, 9, 6, 10, 8][index] }));
const CHART_CONFIG = { xAxisKey: 'name', dataKey: 'value', showAnimation: false } as const;

/** O gráfico da amostra: um só, do mesmo tipo em todas as opções, com o espaçamento interno do motor intacto. */
const PROTO_CHART_FRAME = { width: 300, height: 220 } as const;

const Pad: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex w-full flex-col gap-3 p-4">{children}</div>;

/** A amostra de cada tipo do grupo de Componentes, com o componente real que a lib tem e que cabe numa miniatura. */
const COMPONENT_SAMPLES: Record<string, () => React.ReactElement> = {
    table: () => <Pad><Suspense fallback={null}><SarakDataTable columns={TABLE_COLUMNS} rows={TABLE_ROWS} height={176} responsive={false} reorderable={false} getRowKey={(row) => (row as { id: string }).id} /></Suspense></Pad>,
    chart: () => <div style={{ width: PROTO_CHART_FRAME.width, height: PROTO_CHART_FRAME.height }}><SarakChartEngine type="area" data={CHART_DATA} config={CHART_CONFIG} height={PROTO_CHART_FRAME.height} /></div>,
    badge: () => <Pad><div className="flex gap-2"><SarakBadge variant="success">OK</SarakBadge><SarakBadge variant="warning">!</SarakBadge><SarakBadge variant="danger">×</SarakBadge></div><SarakProgress value={60} /><SarakProgress value={35} thresholds={[{ value: 30, variant: 'warning' }]} /></Pad>,
    emptyState: () => <div className="w-full"><SarakEmptyState title="Nada por aqui" description="Sem itens ainda." /></div>,
};

export type ProtoKind = 'card' | 'cardTexture' | 'bgTexture' | keyof typeof COMPONENT_SAMPLES;
export const PROTO_FRAMES: Record<string, { width: number; height: number }> = {
    card: PROTO_CARD_FRAME, cardTexture: PROTO_CARD_FRAME, bgTexture: { width: 150, height: 129 },
    table: { width: 300, height: 240 }, chart: { width: PROTO_CHART_FRAME.width + 16, height: PROTO_CHART_FRAME.height + 16 }, badge: { width: 300, height: 200 }, emptyState: { width: 300, height: 280 },
};

interface ProtoTileProps { preset: ComponentPreset; kind: ProtoKind; draft: Partial<SarakDesignState> | undefined; mode: Mode }

/** Uma opção do protótipo: o mesmo escopo do painel (rascunho + opção + modo, só visível), com o componente real por dentro. */
export const ProtoTile: React.FC<ProtoTileProps> = ({ preset, kind, draft, mode }) => {
    const frame = PROTO_FRAMES[kind];
    const design = useMemo(() => ({ ...draft, ...preset.design, mode }) as SarakDesignState, [draft, preset.design, mode]);
    // O gráfico usa as cores do tema: a paleta do motor parte da primária do rascunho, e não da paleta própria do gráfico.
    const tokens = useMemo(() => (kind === 'chart' && draft?.primaryColor ? { ...preset.design, chartColorPalette: draft.primaryColor } : preset.design), [kind, draft, preset.design]);
    const textured = kind === 'cardTexture' || kind === 'bgTexture';
    const texture = kind === 'cardTexture' ? String(preset.design.cardTextureType) : kind === 'bgTexture' ? String(preset.design.texture) : undefined;
    const sample = kind === 'card' || kind === 'cardTexture' ? <ProtoCard design={design} /> : kind === 'bgTexture' ? <ProtoBackgroundOnly /> : COMPONENT_SAMPLES[kind]();
    return (
        <OptionTile name={preset.name ?? preset.id} onApply={noop} peekTokens={() => preset.design} frameWidth={frame.width} frameHeight={frame.height}>
            <SampleScope
                draft={draft}
                tokens={tokens}
                mode={mode}
                className="flex items-center justify-center p-4"
                style={textured ? SAMPLE_TEXTURE_STYLE : undefined}
                scopeProps={kind === 'cardTexture' ? { 'data-sx-card-texture-type': texture } : kind === 'bgTexture' ? { 'data-sx-texture': texture } : undefined}
            >
                {sample}
            </SampleScope>
        </OptionTile>
    );
};
