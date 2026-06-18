import { SarakMatrixManifest, MatrixNodeConfig } from '../SarakExpandableMatrix';

export const resolveConfig = (node: any, level: number, manifest?: SarakMatrixManifest): MatrixNodeConfig => {
    const fallback: MatrixNodeConfig = {
        variant: level === 0 ? 'card' : 'row',
        hasToggle: true,
        hasExpand: !!(node.children && node.children.length > 0),
        defaultExpanded: false
    };

    if (!manifest) return fallback;

    const typeConfig = node.type ? manifest.types?.[node.type] : undefined;
    const levelConfig = manifest.levels?.[level];
    const defaultConfig = manifest.default;

    return {
        variant: typeConfig?.variant ?? levelConfig?.variant ?? defaultConfig?.variant ?? fallback.variant,
        hasToggle: typeConfig?.hasToggle ?? levelConfig?.hasToggle ?? defaultConfig?.hasToggle ?? fallback.hasToggle,
        hasExpand: typeConfig?.hasExpand ?? levelConfig?.hasExpand ?? defaultConfig?.hasExpand ?? fallback.hasExpand,
        defaultExpanded: typeConfig?.defaultExpanded ?? levelConfig?.defaultExpanded ?? defaultConfig?.defaultExpanded ?? fallback.defaultExpanded,
        icon: typeConfig?.icon ?? levelConfig?.icon ?? defaultConfig?.icon,
        renderCustom: typeConfig?.renderCustom ?? levelConfig?.renderCustom ?? defaultConfig?.renderCustom
    };
};
