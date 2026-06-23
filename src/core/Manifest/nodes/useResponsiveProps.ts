/**
 * Resolução da diretiva `responsive` (Spec 16, Regra 2).
 *
 * Sobrepõe as props base com as camadas do breakpoint ativo em cascata
 * mobile-first: `mob` é a base; em tablet acrescenta `tab`; em desktop acrescenta
 * `tab`+`desk`. A função de merge é PURA (testável isoladamente, Regra 3); o hook
 * apenas memoiza e pluga o dispositivo ativo. Reaproveita o nó — só recalcula
 * props, nunca remonta (Regra 5).
 */

import { useMemo } from 'react';
import type { ManifestProps, ResponsiveDirective } from '../types';
import { useSarakDevice, type DeviceType } from '../../Provider/DeviceProvider';

/** Camadas aplicáveis por dispositivo, na ordem de cascata mobile-first. */
const layersForDevice = (
    responsive: ResponsiveDirective,
    device: DeviceType,
): Array<Partial<ManifestProps> | undefined> => {
    if (device === 'desktop') return [responsive.mob, responsive.tab, responsive.desk];
    if (device === 'tablet') return [responsive.mob, responsive.tab];
    return [responsive.mob];
};

/**
 * Mescla as props base com a camada responsiva do dispositivo ativo (mobile-first).
 * Sem diretiva, devolve a referência original (evita recalculo/remonte).
 */
export const mergeResponsiveProps = (
    base: ManifestProps,
    responsive: ResponsiveDirective | undefined,
    device: DeviceType,
): ManifestProps => {
    if (!responsive) return base;
    const applicable = layersForDevice(responsive, device).filter(
        (layer): layer is Partial<ManifestProps> => Boolean(layer),
    );
    if (applicable.length === 0) return base;
    return Object.assign({}, base, ...applicable);
};

/** Hook: resolve as props responsivas do nó contra o dispositivo ativo. */
export const useResponsiveProps = (
    base: ManifestProps,
    responsive: ResponsiveDirective | undefined,
): ManifestProps => {
    const device = useSarakDevice();
    return useMemo(() => mergeResponsiveProps(base, responsive, device), [base, responsive, device]);
};
