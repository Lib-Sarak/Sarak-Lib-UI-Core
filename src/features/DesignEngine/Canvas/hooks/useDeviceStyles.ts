export const useDeviceStyles = (previewDevice: string) => {
    const deviceWidths = {
        desktop: '100%',
        tablet: '768px',
        smartphone: '375px'
    };
    const targetWidth = deviceWidths[previewDevice as keyof typeof deviceWidths] || '100%';

    const getDeviceFrameStyles = () => {
        if (previewDevice === 'smartphone') {
            return "rounded-[3rem] border-[14px] border-[#1a1a1c] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-theme-text)_10%,transparent),_0_50px_100px_-20px_color-mix(in_srgb,var(--color-theme-body)_80%,transparent)]";
        }
        if (previewDevice === 'tablet') {
            return "rounded-[2rem] border-[24px] border-[#1a1a1c] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-theme-text)_10%,transparent),_0_50px_100px_-20px_color-mix(in_srgb,var(--color-theme-body)_80%,transparent)]";
        }
        return "rounded-[2rem] border border-theme-text/10 shadow-[0_50px_100px_-20px_color-mix(in_srgb,var(--color-theme-body)_80%,transparent)]";
    };

    return {
        targetWidth,
        getDeviceFrameStyles,
    };
};
