import React from 'react';
import { SarakIcon } from '../../Icon/SarakIcon';
import { SarakMenuItem } from '../SarakMenuItem';
import { useNavigationAppearance } from '../../../../core/Provider/useNavigationAppearance';
import {
    MENU_ITEM_FONT_SIZE,
    MENU_ITEM_LINE_HEIGHT,
    horizontalMenuItemBlockPadding,
    verticalMenuItemSpacing,
} from '../menuItemMetrics';

export interface ShellPreferenceChoice<T extends string> {
    value: T;
    /** O rótulo curto na barra (P, M, G) e a linha inteira no menu. */
    label: string;
    /** Tooltip e nome acessível quando o rótulo curto não basta. */
    full?: string;
}

export interface ShellPreferenceChoiceGroupProps<T extends string> {
    /** O nome do grupo: lido pelo leitor de tela e título da linha no menu. */
    label: string;
    /** Só na variante `menu`: o título visível da linha, quando difere do nome acessível do grupo. */
    heading?: string;
    choices: ShellPreferenceChoice<T>[];
    current: T;
    onSelect: (value: T) => void;
    /**
     * `bar` é o grupo fixado: botões juntos, com a altura de um item de navegação. `menu` são linhas do ⚙ ou da gaveta, com a
     * seleção marcada por visto — nunca pílulas.
     */
    variant: 'bar' | 'menu';
    /** Só na variante `bar`: `vertical` ocupa a coluna da barra lateral, com a altura do item dela. */
    orientation?: 'horizontal' | 'vertical';
}

/** As linhas do menu ficam mais juntas que as da lista de navegação: meio vão de layout acima e abaixo do texto. */
const MENU_ROW_STYLE: React.CSSProperties = { paddingBlock: 'calc(var(--sarak-layout-gap-sm, 8px) / 2)' };
const MENU_GROUP_STYLE: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const GROUP_FRAME_SHADOW = 'inset 0 0 0 var(--sarak-border-width, 1px) var(--border-color, var(--theme-border, rgba(255,255,255,0.09)))';

/**
 * O texto da opção que não está escolhida: o texto principal da barra, não o apagado do rótulo de item inativo. O apagado cai
 * abaixo de 4,5:1 sobre a parada clara de uma barra em degradê no modo claro; o grupo é pequeno e a escolhida já se distingue pelo fundo.
 */
const IDLE_CLASS = 'text-[var(--sarak-text-main,#f2f6fb)]';

/**
 * Um grupo de escolha exclusiva da barra (tamanho da fonte, navegação lateral/topo). Fixado na barra, é um grupo compacto com
 * a altura de um item de navegação e sem véu de fundo: o texto fica direto sobre a barra, então o
 * contraste é o da própria barra, inclusive sobre degradê. No menu, uma linha por opção com a escolhida marcada.
 *
 * @sarak-encapsula button — grupo exclusivo com `aria-pressed`, sem equivalente em `SarakButton`/`SarakIconButton`; o
 *   `<button>` nativo dá foco e teclado por construção, como em `SarakMenuItem`.
 */
export const ShellPreferenceChoiceGroup = <T extends string>(props: ShellPreferenceChoiceGroupProps<T>): React.ReactElement => {
    const { label, heading, choices, current, onSelect, variant, orientation = 'horizontal' } = props;
    const appearance = useNavigationAppearance();

    if (variant === 'menu') {
        return (
            <div role="group" aria-label={label} style={MENU_GROUP_STYLE}>
                <span
                    aria-hidden="true"
                    className="text-xs text-[var(--text-muted,rgba(242,246,251,0.55))]"
                    style={{ paddingInline: verticalMenuItemSpacing(appearance.sidebarItemDensity, 'px') }}
                >
                    {heading ?? label}
                </span>
                {choices.map((choice) => {
                    const selected = choice.value === current;
                    return (
                        <SarakMenuItem
                            key={choice.value}
                            role="menuitemradio"
                            aria-checked={selected}
                            icon={selected ? <SarakIcon name="Check" size="var(--sarak-sidebar-icon-size, 18px)" /> : <span />}
                            label={choice.full ?? choice.label}
                            title={choice.full ?? choice.label}
                            className={selected ? 'font-bold text-[var(--sarak-text-main,#f2f6fb)]' : undefined}
                            style={MENU_ROW_STYLE}
                            onClick={() => onSelect(choice.value)}
                        />
                    );
                })}
            </div>
        );
    }

    const isVertical = orientation === 'vertical';
    const paddingBlock = isVertical
        ? verticalMenuItemSpacing(appearance.sidebarItemDensity, 'py')
        : horizontalMenuItemBlockPadding(appearance.topbarItemDensity);
    return (
        <div
            role="group"
            aria-label={label}
            className={`${isVertical ? 'flex w-full' : 'inline-flex'} items-stretch overflow-hidden rounded-[var(--sarak-nav-item-radius,12px)]`}
            style={{ boxShadow: GROUP_FRAME_SHADOW }}
        >
            {choices.map((choice) => {
                const selected = choice.value === current;
                return (
                    <button
                        key={choice.value}
                        type="button"
                        aria-pressed={selected}
                        title={choice.full ?? choice.label}
                        onClick={() => onSelect(choice.value)}
                        className={`${isVertical ? 'flex-1' : ''} inline-flex items-center justify-center font-bold transition-colors ${
                            selected
                                ? 'bg-[var(--sarak-nav-active-color,#19e3f0)] text-[var(--sarak-on-nav-active,var(--color-theme-on-primary,#020617))]'
                                : IDLE_CLASS
                        }`}
                        style={{
                            paddingBlock,
                            paddingInline: 'var(--sarak-layout-gap-sm, 8px)',
                            fontSize: MENU_ITEM_FONT_SIZE,
                            lineHeight: MENU_ITEM_LINE_HEIGHT,
                        }}
                    >
                        {choice.label}
                    </button>
                );
            })}
        </div>
    );
};

export default ShellPreferenceChoiceGroup;
