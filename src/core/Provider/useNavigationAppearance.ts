import { useContext } from 'react';
import { NavigationSchema } from '../Design/schema/navigation';
import { DesignOverrideContext, UIContext } from './context';

export type ChromeBorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
export type ChromeBorderSide = 'edge' | 'top' | 'right' | 'bottom' | 'left' | 'all' | 'none';
export type ChromeBackgroundStyle = 'solid' | 'gradient' | 'texture';
export type NavigationActiveItemStyle = 'bar' | 'pill' | 'underline' | 'filled' | 'outline';
export type NavigationItemDensity = 'compact' | 'comfortable' | 'spacious';

export interface NavigationAppearance {
    sidebarBorderStyle: ChromeBorderStyle;
    sidebarBorderSide: ChromeBorderSide;
    sidebarBackgroundStyle: ChromeBackgroundStyle;
    sidebarActiveItemStyle: NavigationActiveItemStyle;
    sidebarItemDensity: NavigationItemDensity;
    topbarBorderStyle: ChromeBorderStyle;
    topbarBorderSide: ChromeBorderSide;
    topbarBackgroundStyle: ChromeBackgroundStyle;
    topbarActiveItemStyle: NavigationActiveItemStyle;
    topbarItemDensity: NavigationItemDensity;
}

const enumValues = <T extends string>(values: readonly T[]): readonly string[] => values;

const validValues: Record<keyof NavigationAppearance, readonly string[]> = {
    sidebarBorderStyle: enumValues(['solid', 'dashed', 'dotted', 'double', 'none']),
    sidebarBorderSide: enumValues(['edge', 'top', 'right', 'bottom', 'left', 'all', 'none']),
    sidebarBackgroundStyle: enumValues(['solid', 'gradient', 'texture']),
    sidebarActiveItemStyle: enumValues(['bar', 'pill', 'underline', 'filled', 'outline']),
    sidebarItemDensity: enumValues(['compact', 'comfortable', 'spacious']),
    topbarBorderStyle: enumValues(['solid', 'dashed', 'dotted', 'double', 'none']),
    topbarBorderSide: enumValues(['edge', 'top', 'right', 'bottom', 'left', 'all', 'none']),
    topbarBackgroundStyle: enumValues(['solid', 'gradient', 'texture']),
    topbarActiveItemStyle: enumValues(['bar', 'pill', 'underline', 'filled', 'outline']),
    topbarItemDensity: enumValues(['compact', 'comfortable', 'spacious']),
};

const tokenDefaults = Object.fromEntries(
    NavigationSchema.tokens.map((token) => [token.id, token.defaultValue]),
) as Record<string, unknown>;

const resolveToken = <T extends string>(design: Record<string, unknown>, key: keyof NavigationAppearance): T => {
    const value = design[key];
    if (typeof value === 'string' && validValues[key].includes(value)) return value as T;
    return tokenDefaults[key] as T;
};

/** Lê as opções estruturais da barra e respeita o rascunho aberto no painel de tema. */
export const useNavigationAppearance = (): NavigationAppearance => {
    const context = useContext(UIContext);
    const override = useContext(DesignOverrideContext);
    const design = (override ?? context?.design ?? {}) as Record<string, unknown>;

    return {
        sidebarBorderStyle: resolveToken(design, 'sidebarBorderStyle'),
        sidebarBorderSide: resolveToken(design, 'sidebarBorderSide'),
        sidebarBackgroundStyle: resolveToken(design, 'sidebarBackgroundStyle'),
        sidebarActiveItemStyle: resolveToken(design, 'sidebarActiveItemStyle'),
        sidebarItemDensity: resolveToken(design, 'sidebarItemDensity'),
        topbarBorderStyle: resolveToken(design, 'topbarBorderStyle'),
        topbarBorderSide: resolveToken(design, 'topbarBorderSide'),
        topbarBackgroundStyle: resolveToken(design, 'topbarBackgroundStyle'),
        topbarActiveItemStyle: resolveToken(design, 'topbarActiveItemStyle'),
        topbarItemDensity: resolveToken(design, 'topbarItemDensity'),
    };
};
