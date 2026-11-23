import React, { useMemo } from 'react';
import { SarakDeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { SarakAppChrome, type SarakNavItem } from '../../../../components/Layout/SarakAppChrome';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { DesignOverrideContext } from '../../../../core/Provider/SarakUIProvider';
import { SarakThemePreset } from '../../../../core/Design/presets/themes';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import { withThemePalette } from '../../../../core/Design/presets/themes/compose';
import type { SarakTokenValue } from '../../../../core/Design/types';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { MockDashboard } from '../Mocks/DashboardMock';
import { LazyWhenVisible } from './LazyWhenVisible';
import { OptionTile } from './OptionTile';
import { BAR_WIDGETS_OFF } from './PresetGroupCatalog';
import type { PeekHandler } from './peek';

/** O quadro de referência da miniatura de um tema, em px de tela: o tamanho em que o sistema é desenhado antes de a opção o reduzir. */
export const THEME_FRAME = { width: 1024, height: 576 } as const;

const SCOPE_INK: React.CSSProperties = { color: 'var(--sarak-text-main)', backgroundColor: 'var(--sarak-bg-base)' };
/** A classe do escopo de toda miniatura; é por ela que a regra abaixo a alcança. */
const MINIATURE_CLASS = 'sarak-theme-miniature';
/**
 * A miniatura é uma figura parada: o tema pode trazer animação sem fim (pulso do cartão, cintilar de estrelas, deriva da
 * atmosfera), e ela, repetida em vinte miniaturas, recalcula o estilo a cada quadro enquanto a galeria está aberta.
 * A galeria escreve esta regra uma vez, sem `!important`: ela fica fora de qualquer camada, e o CSS fora de camada vence o das camadas.
 */
export const MINIATURE_STILL_CSS = `.${MINIATURE_CLASS},.${MINIATURE_CLASS}::before,.${MINIATURE_CLASS}::after,.${MINIATURE_CLASS} *,.${MINIATURE_CLASS} *::before,.${MINIATURE_CLASS} *::after{animation:none;transition:none}`;
const noop = (): void => undefined;

/** Marca de amostra neutra: um quadrado na cor primária do tema. */
const SampleLogo: React.FC = () => (
    <span aria-hidden="true" className="block aspect-square rounded-[var(--sarak-card-radius,10px)]" style={{ height: 'var(--sarak-shell-brand-logo-size, 32px)', backgroundColor: 'var(--theme-primary)' }} />
);

/**
 * O escopo de variáveis da miniatura, enxuto: as variáveis do tema e o contexto de design para os componentes de dentro, e nada
 * do que o `SarakDesignScope` guarda para uma tela viva (a marca de troca de tema, o fundo, o CSS responsivo). Uma figura parada
 * não precisa deles, e um escopo completo por miniatura fazia trocar o tema do painel recalcular o estilo dezenas de vezes.
 */
const MiniatureScope: React.FC<{ design: SarakDesignState; children: React.ReactNode }> = ({ design, children }) => {
    const { variables, attributes } = useDesignVariables(design as unknown as Record<string, unknown>);
    return (
        <DesignOverrideContext.Provider value={design}>
            <div className={`sarak-design-scope ${MINIATURE_CLASS} ${design.mode || 'dark'}`} style={{ width: '100%', height: '100%', ...variables, ...SCOPE_INK, position: 'relative' }} {...attributes}>
                {children}
            </div>
        </DesignOverrideContext.Provider>
    );
};

interface ThemeMiniatureProps {
    theme: SarakThemePreset;
    currentMode: string;
}

/**
 * O sistema desenhado com o tema aplicado inteiro: o cromo real (a barra lateral ou a de topo que o tema declara) e a tela "Painel"
 * inteira da prévia (`MockDashboard`), reduzida; abrir a galeria custa menos de 2× o da miniatura anterior (medido em `amostras-reais-custo`).
 * Só monta quando a opção entra na área visível (`LazyWhenVisible`), e é aqui, não no cartão, que a paleta é resolvida:
 * resolver custa de 5 a 19 ms por tema, e uma galeria longa não paga isso pelas miniaturas que ninguém viu.
 */
const ThemeMiniature: React.FC<ThemeMiniatureProps> = React.memo(({ theme, currentMode }) => {
    const text = useLibraryText();
    const design = useMemo(() => ({
        ...BAR_WIDGETS_OFF,
        ...withThemePalette(resolveThemeForMode(
            { design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte },
            currentMode as 'light' | 'dark',
        )),
        globalBackgroundImageUrl: undefined,
    }) as unknown as SarakDesignState, [theme.design, theme.contraparte, currentMode]);
    const navItems = useMemo<SarakNavItem[]>(() => [
        { id: 'home', label: text('barSampleHome'), href: '#home', icon: 'Home' },
        { id: 'sales', label: text('barSampleSales'), href: '#sales', icon: 'Briefcase' },
        { id: 'orders', label: text('barSampleOrders'), href: '#orders', icon: 'FileText', active: true },
    ], [text]);
    return (
        <MiniatureScope design={design}>
            <SarakDeviceProvider overrideDevice="desktop">
                <div data-testid="theme-miniature" style={{ width: THEME_FRAME.width, height: THEME_FRAME.height, transform: 'translateZ(0)' }}>
                    <SarakAppChrome
                        brand={{ name: text('barSampleBrand') }}
                        logo={<SampleLogo />}
                        navItems={navItems}
                        user={{ name: text('barSampleUser') }}
                        logout={noop}
                        onNavigate={noop}
                        style={{ height: '100%' }}
                    >
                        <div className="h-full overflow-hidden"><MockDashboard tokens={design} inheritVariables /></div>
                    </SarakAppChrome>
                </div>
            </SarakDeviceProvider>
        </MiniatureScope>
    );
});
ThemeMiniature.displayName = 'ThemeMiniature';

interface PresetCardProps {
    theme: SarakThemePreset;
    currentMode: string;
    onApply: () => void;
    /** Os tokens que a espiada compõe por cima do rascunho; omitido, o tema não espia. */
    peekTokens?: () => Partial<SarakDesignState> | null;
    onPeek?: PeekHandler;
}

const noTokens = (): null => null;

/**
 * A opção de um tema na galeria: a miniatura é o sistema real com o tema aplicado (desenhada só quando visível), e o nome
 * fica embaixo, proporcional. A miniatura e o botão seguem o `OptionTile`: o nome acessível é só o nome do tema.
 */
export const PresetCard = ({ theme, currentMode, onApply, peekTokens, onPeek }: PresetCardProps) => (
    <OptionTile
        name={theme.name}
        description={theme.description}
        onApply={onApply}
        peekTokens={peekTokens ?? noTokens}
        onPeek={onPeek}
        frameWidth={THEME_FRAME.width}
        frameHeight={THEME_FRAME.height}
        buttonProps={{ 'data-theme-id': theme.id }}
        peekWhenMounted
    >
        <LazyWhenVisible className="h-full">
            <ThemeMiniature theme={theme} currentMode={currentMode} />
        </LazyWhenVisible>
    </OptionTile>
);
