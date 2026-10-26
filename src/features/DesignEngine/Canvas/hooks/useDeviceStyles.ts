import { sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import type { SarakDesignState } from '../../../../core/Provider/types';

const DEFAULT_DESIGN_STATE = sarakGetDefaultDesignState() as Partial<SarakDesignState>;

export const useDeviceStyles = (
    previewDevice: string,
    tokens: Partial<SarakDesignState> = DEFAULT_DESIGN_STATE,
) => {
    const deviceWidths = {
        desktop: '100%',
        tablet: '768px',
        smartphone: '375px'
    };
    const targetWidth = deviceWidths[previewDevice as keyof typeof deviceWidths] || '100%';
    const deviceAspectRatio = getDeviceAspectRatio(previewDevice, targetWidth, tokens);

    const getDeviceFrameStyles = () => {
        if (previewDevice === 'smartphone') {
            return "rounded-[3rem] border-[14px] border-[color-mix(in_srgb,var(--color-theme-text,#f2f6fb)_14%,var(--color-theme-body,#06080d))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-theme-text)_10%,transparent),_0_50px_100px_-20px_color-mix(in_srgb,var(--color-theme-body)_80%,transparent)]";
        }
        if (previewDevice === 'tablet') {
            return "rounded-[2rem] border-[24px] border-[color-mix(in_srgb,var(--color-theme-text,#f2f6fb)_14%,var(--color-theme-body,#06080d))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-theme-text)_10%,transparent),_0_50px_100px_-20px_color-mix(in_srgb,var(--color-theme-body)_80%,transparent)]";
        }
        return "rounded-[2rem] border border-theme-text/10 shadow-[0_50px_100px_-20px_color-mix(in_srgb,var(--color-theme-body)_80%,transparent)]";
    };

    return {
        targetWidth,
        deviceAspectRatio,
        getDeviceFrameStyles,
    };
};

const getDeviceAspectRatio = (
    previewDevice: string,
    targetWidth: string,
    tokens: Partial<SarakDesignState>,
): string | undefined => {
    if (previewDevice === 'desktop') return undefined;

    const height = previewDevice === 'tablet'
        ? tokens.deviceTabletHeight ?? DEFAULT_DESIGN_STATE.deviceTabletHeight
        : tokens.devicePhoneHeight ?? DEFAULT_DESIGN_STATE.devicePhoneHeight;
    const width = Number.parseFloat(targetWidth);

    if (typeof height !== 'number' || height <= 0 || !Number.isFinite(width)) return undefined;
    return `${width} / ${height}`;
};
