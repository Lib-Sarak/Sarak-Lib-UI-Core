export const useDeviceStyles = (previewDevice: string, isPreviewStacked: boolean | undefined) => {
    const deviceWidths = {
        desktop: '100%',
        tablet: '768px',
        smartphone: '375px'
    };
    const targetWidth = deviceWidths[previewDevice as keyof typeof deviceWidths] || '100%';

    const getDeviceFrameStyles = () => {
        if (previewDevice === 'smartphone') {
            return "rounded-[3rem] border-[14px] border-[#1a1a1c] shadow-[0_0_0_1px_rgba(255,255,255,0.1),_0_50px_100px_-20px_rgba(0,0,0,0.8)]";
        }
        if (previewDevice === 'tablet') {
            return "rounded-[2rem] border-[24px] border-[#1a1a1c] shadow-[0_0_0_1px_rgba(255,255,255,0.1),_0_50px_100px_-20px_rgba(0,0,0,0.8)]";
        }
        return "rounded-[2rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]";
    };

    const getDeviceHeightClass = () => {
        if (previewDevice !== 'desktop') return '';
        return isPreviewStacked ? 'h-[45vh]' : 'h-full';
    };

    return {
        targetWidth,
        getDeviceFrameStyles,
        getDeviceHeightClass
    };
};
