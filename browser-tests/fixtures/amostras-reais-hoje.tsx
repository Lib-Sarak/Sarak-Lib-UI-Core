/**
 * A miniatura de tema ANTES da plan-166, congelada (a de `PresetCard.tsx` com o conteúdo enxuto: três cartões de métrica e um de
 * gráfico, quadro 640×400). Existe só para o spec de custo medir o antes e o depois na mesma rodada, sem depender de números
 * antigos. Quando a plan-166 for sintetizada, esta cópia sai junto com a comparação.
 */
import React, { useMemo } from 'react';
import { SarakAppChrome, type SarakNavItem } from '../../src/components/Layout/SarakAppChrome';
import { SarakCard } from '../../src/components/atomic/Cards/SarakCard';
import { resolveThemeForMode } from '../../src/core/Design/presets/themes/color-engine';
import { withThemePalette } from '../../src/core/Design/presets/themes/compose';
import type { SarakThemePreset } from '../../src/core/Design/presets/themes';
import type { SarakTokenValue } from '../../src/core/Design/types';
import type { SarakDesignState } from '../../src/core/Provider/types';
import { useLibraryText } from '../../src/core/i18n/useLibraryText';
import { OptionTile } from '../../src/features/DesignEngine/Canvas/components/OptionTile';
import { LazyWhenVisible } from '../../src/features/DesignEngine/Canvas/components/LazyWhenVisible';
import { BAR_WIDGETS_OFF } from '../../src/features/DesignEngine/Canvas/components/PresetGroupCatalog';
import { MiniatureScope, type Mode } from './amostras-reais-prototipos';

const noop = (): void => undefined;
const OLD_FRAME = { width: 640, height: 400 } as const;
const BAR_HEIGHTS = [40, 70, 30, 90, 50, 80, 60];

const OldContent: React.FC = () => {
    const text = useLibraryText();
    return (
        <div aria-hidden="true" className="flex h-full w-full flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
                <span className="block h-3 w-1/3 rounded-full" style={{ backgroundColor: 'var(--sarak-text-main)', opacity: 0.6 }} />
                <span className="block h-2 w-1/4 rounded-full" style={{ backgroundColor: 'var(--sarak-text-main)', opacity: 0.25 }} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                    <SarakCard key={index}><SarakCard.Body><span className="block h-2 w-3/5 rounded-full" style={{ backgroundColor: 'var(--sarak-text-main)', opacity: 0.25 }} /><p className="mt-2 text-2xl font-bold">{text('fontSampleNumber')}</p></SarakCard.Body></SarakCard>
                ))}
            </div>
            <SarakCard className="flex-1"><SarakCard.Body><div className="flex h-full items-end gap-2">{BAR_HEIGHTS.map((height, index) => <span key={index} className="block flex-1 rounded-t-sm" style={{ height: `${height}%`, backgroundColor: 'var(--theme-primary)', opacity: 0.55 + index * 0.06 }} />)}</div></SarakCard.Body></SarakCard>
        </div>
    );
};

const OldMiniature: React.FC<{ theme: SarakThemePreset; currentMode: Mode }> = React.memo(({ theme, currentMode }) => {
    const text = useLibraryText();
    const design = useMemo(() => ({
        ...BAR_WIDGETS_OFF,
        ...withThemePalette(resolveThemeForMode({ design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, currentMode)),
        globalBackgroundImageUrl: undefined,
    }) as unknown as SarakDesignState, [theme.design, theme.contraparte, currentMode]);
    const navItems = useMemo<SarakNavItem[]>(() => [
        { id: 'home', label: text('barSampleHome'), href: '#home', icon: 'Home' },
        { id: 'sales', label: text('barSampleSales'), href: '#sales', icon: 'Briefcase' },
        { id: 'orders', label: text('barSampleOrders'), href: '#orders', icon: 'FileText', active: true },
    ], [text]);
    return (
        <MiniatureScope design={design}>
            <div data-testid="theme-miniature" style={{ width: OLD_FRAME.width, height: OLD_FRAME.height, transform: 'translateZ(0)' }}>
                <SarakAppChrome brand={{ name: text('barSampleBrand') }} navItems={navItems} user={{ name: text('barSampleUser') }} logout={noop} onNavigate={noop} style={{ height: '100%' }}><OldContent /></SarakAppChrome>
            </div>
        </MiniatureScope>
    );
});
OldMiniature.displayName = 'OldMiniature';

export const OldThemeTile: React.FC<{ theme: SarakThemePreset; currentMode: Mode }> = ({ theme, currentMode }) => (
    <OptionTile name={theme.name} description={theme.description} onApply={noop} peekTokens={() => null} frameWidth={OLD_FRAME.width} frameHeight={OLD_FRAME.height} buttonProps={{ 'data-theme-id': theme.id }}>
        <LazyWhenVisible className="h-full"><OldMiniature theme={theme} currentMode={currentMode} /></LazyWhenVisible>
    </OptionTile>
);
