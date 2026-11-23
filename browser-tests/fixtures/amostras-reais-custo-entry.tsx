/**
 * A bancada de custo das amostras do painel (lote 1 da plan-166). Abre UM grupo de opções numa coluna do tamanho da coluna do
 * painel, de dois jeitos: `variante=hoje` monta o catálogo de produção (`PresetsCatalog`) e `variante=prototipo` monta o
 * protótipo com o componente real (`amostras-reais-prototipos.tsx`). Os dois partem do mesmo `SarakUIProvider`, do mesmo
 * rascunho e do mesmo modo, e só o que a amostra desenha muda.
 *
 * Parâmetros: `grupo` (id do grupo do registro, ou `themes`), `variante`, `claro=1`, `captura=1` (a coluna sem altura fixa).
 * O botão `abrir` monta a coluna: o spec mede dali até o primeiro cartão pintado. O botão `trocar-modo` inverte o modo.
 */
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider, useSarakUI } from '../../src/core/Provider/SarakUIProvider';
import { getPresetGroup } from '../../src/core/Design/presets/components/registry';
import { resolveThemeForMode } from '../../src/core/Design/presets/themes/color-engine';
import { withThemePalette } from '../../src/core/Design/presets/themes/compose';
import { findThemeEntry } from '../../src/core/Provider/utils/designChoices';
import { PresetsCatalog } from '../../src/features/DesignEngine/Canvas/components/PresetsCatalog';
import { useCatalogThemes } from '../../src/features/DesignEngine/Canvas/components/useCatalogThemes';
import { THEME_GALLERY_GRID } from '../../src/features/DesignEngine/Canvas/panelResponsive.presets';
import { OldThemeTile } from './amostras-reais-hoje';
import { ProtoStillCss, ProtoThemeTile, ProtoTile, type Mode, type ProtoKind } from './amostras-reais-prototipos';

const params = new URLSearchParams(window.location.search);
const groupId = params.get('grupo') ?? 'themes';
const variantParam = params.get('variante');
/** `hoje`: a miniatura de tema congelada de antes da plan-166 (os demais grupos, o catálogo de produção); `atual`: o catálogo de produção; `prototipo`: o protótipo do lote 1. */
const variant = variantParam === 'prototipo' ? 'prototipo' : variantParam === 'atual' ? 'atual' : 'hoje';
const startMode: Mode = params.get('claro') === '1' ? 'light' : 'dark';
const capture = params.get('captura') === '1';
const COLUMN_WIDTH = 360;
const COLUMN_HEIGHT = 900;

/** O tipo de amostra do protótipo de cada grupo; o grupo que não está aqui não tem protótipo e fica como é hoje. */
const PROTO_KIND: Record<string, ProtoKind> = {
    cards: 'card', shadow: 'card', shadowDirection: 'card', material: 'card', corners: 'card', density: 'card', border: 'card',
    cardTextures: 'cardTexture', textures: 'bgTexture',
    tables: 'table', charts: 'chart', badge: 'badge', emptyState: 'emptyState',
};
/** O grupo do protótipo: só as opções destacadas, como a decisão abre (o "Ver todas" fica fechado). */
/** A barra de opacidade da textura do fundo, mantida como o catálogo de produção a desenha. */
const OpacitySlider: React.FC = () => (
    <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3 rounded-xl border border-theme-border px-4 py-2">
            <span className="text-[11px] font-black uppercase tracking-widest">Opacidade</span>
            <input type="range" min="0" max="1" step="0.01" defaultValue={0.08} className="w-32 cursor-pointer accent-[var(--theme-primary)]" />
        </div>
    </div>
);

/**
 * O rascunho do modo da variante: o do tema do sistema resolvido para o modo pedido (a contraparte no claro), como o painel real o passa
 * ao catálogo. `systemDesign` guarda o do modo nativo do tema, e usá-lo nos dois modos pintava os cards claros com a paleta escura.
 */
const useDraftOfMode = (mode: Mode): Record<string, unknown> => {
    const ui = useSarakUI();
    return useMemo(() => {
        const theme = findThemeEntry(ui.allThemes, ui.resolvedThemeId);
        const base = ui.systemDesign as Record<string, unknown>;
        return theme ? { ...base, ...withThemePalette(resolveThemeForMode(theme, mode)), mode } : { ...base, mode };
    }, [ui.allThemes, ui.resolvedThemeId, ui.systemDesign, mode]);
};

const ProtoGroup: React.FC<{ id: string; kind: ProtoKind; mode: Mode }> = ({ id, kind, mode }) => {
    const draft = useDraftOfMode(mode);
    const group = getPresetGroup(id);
    if (!group) return null;
    const gridTemplateColumns = kind === 'card' || kind === 'cardTexture' || kind === 'bgTexture' ? 'repeat(auto-fill,minmax(10.5rem,1fr))' : 'repeat(auto-fill,minmax(8.5rem,1fr))';
    const featured = group.featured.flatMap((presetId) => group.presets.filter((preset) => preset.id === presetId));
    return (
        <div data-preset-group={id} className="@container w-full">
            {id === 'textures' && <OpacitySlider />}
            <div className="grid gap-3" style={{ gridTemplateColumns }}>
                {featured.map((preset) => <ProtoTile key={preset.id} preset={preset} kind={kind} draft={draft as never} mode={mode} />)}
            </div>
        </div>
    );
};

const FrozenThemes: React.FC<{ mode: Mode }> = ({ mode }) => {
    const ui = useSarakUI();
    const { rows } = useCatalogThemes(ui);
    return (
        <div className={`grid ${THEME_GALLERY_GRID} gap-3`}>
            <ProtoStillCss />
            {rows.map(({ entry, theme }) => (theme ? <OldThemeTile key={entry.id} theme={theme} currentMode={mode} /> : null))}
        </div>
    );
};

const ProtoThemes: React.FC<{ mode: Mode }> = ({ mode }) => {
    const ui = useSarakUI();
    const { rows } = useCatalogThemes(ui);
    return (
        <div className={`grid ${THEME_GALLERY_GRID} gap-3`}>
            <ProtoStillCss />
            {rows.map(({ entry, theme }) => (theme ? <ProtoThemeTile key={entry.id} theme={theme} currentMode={mode} /> : null))}
        </div>
    );
};

const Today: React.FC<{ mode: Mode }> = ({ mode }) => {
    const ui = useSarakUI();
    const draft = useDraftOfMode(mode);
    return <PresetsCatalog group={groupId} onApplyPreset={() => undefined} currentMode={mode} draftMode={mode} sarak={ui} draft={draft as never} />;
};

const Bench: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>(startMode);
    const kind = PROTO_KIND[groupId];
    const prototype = variant === 'prototipo' && (groupId === 'themes' || kind);
    return (
        <>
            <button data-testid="abrir" onClick={() => setOpen(true)}>abrir</button>
            <button data-testid="trocar-modo" onClick={() => setMode((current) => (current === 'dark' ? 'light' : 'dark'))}>trocar</button>
            <output data-testid="variante-efetiva">{prototype ? 'prototipo' : variant === 'atual' ? 'atual' : 'hoje'}</output>
            {open && (
                <div data-testid="bancada" className="overflow-y-auto p-3" style={{ width: COLUMN_WIDTH, height: capture ? 'auto' : COLUMN_HEIGHT, background: 'var(--sarak-bg-base)' }}>
                    {prototype ? (groupId === 'themes' ? <ProtoThemes mode={mode} /> : <ProtoGroup id={groupId} kind={kind} mode={mode} />) : variant === 'hoje' && groupId === 'themes' ? <FrozenThemes mode={mode} /> : <Today mode={mode} />}
                </div>
            )}
        </>
    );
};

const root = document.getElementById('root');
if (!root) throw new Error('amostras-reais-custo-entry: #root ausente no harness.');
createRoot(root).render(
    <SarakUIProvider initialTheme="sarak-sovereign" options={{ fonts: 'none', mode: 'app', preferences: { defaultColorMode: startMode }, persistence: { strategy: 'hybrid', storageKey: `plan-166-${startMode}-${groupId}-${variant}` } }}>
        <Bench />
    </SarakUIProvider>,
);
