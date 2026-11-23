import { sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import type { SarakDesignState } from '../../../../core/Provider/types';

const DEFAULT_DESIGN_STATE = sarakGetDefaultDesignState() as Partial<SarakDesignState>;

export const useDeviceStyles = (
    previewDevice: string,
    tokens: Partial<SarakDesignState> = DEFAULT_DESIGN_STATE,
) => {
    const deviceWidths = {
        desktop: '100%',
        // sarak-allow-hardcode: as larguras de 768 e 375 px simulam o tablet e o smartphone de referência da prévia; são a medida do aparelho imitado, não do layout.
        tablet: '768px',
        // sarak-allow-hardcode: as larguras de 768 e 375 px simulam o tablet e o smartphone de referência da prévia; são a medida do aparelho imitado, não do layout.
        smartphone: '375px'
    };
    const targetWidth = deviceWidths[previewDevice as keyof typeof deviceWidths] || '100%';
    const deviceAspectRatio = getDeviceAspectRatio(previewDevice, targetWidth, tokens);

    const getDeviceFrameStyles = () => {
        if (previewDevice === 'smartphone') {
            // sarak-allow-hardcode: o raio e a moldura (3rem/14 px, 2rem/24 px) desenham o corpo do aparelho simulado na prévia; o Tailwind exige a classe literal e nenhum token os declara.
            return "rounded-[3rem] border-[14px] border-[color-mix(in_srgb,var(--color-theme-text,#f2f6fb)_14%,var(--color-theme-body,#06080d))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-theme-text)_10%,transparent),_0_50px_100px_-20px_color-mix(in_srgb,var(--color-theme-body)_80%,transparent)]";
        }
        if (previewDevice === 'tablet') {
            // sarak-allow-hardcode: o raio e a moldura (3rem/14 px, 2rem/24 px) desenham o corpo do aparelho simulado na prévia; o Tailwind exige a classe literal e nenhum token os declara.
            return "rounded-[2rem] border-[24px] border-[color-mix(in_srgb,var(--color-theme-text,#f2f6fb)_14%,var(--color-theme-body,#06080d))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-theme-text)_10%,transparent),_0_50px_100px_-20px_color-mix(in_srgb,var(--color-theme-body)_80%,transparent)]";
        }
        // sarak-allow-hardcode: o raio de 2rem e a sombra de 50/100 px desenham a moldura da prévia de desktop; o Tailwind exige a classe literal e nenhum token os declara.
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
