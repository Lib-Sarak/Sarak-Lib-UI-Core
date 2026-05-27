import React from 'react';

interface SarakBackgroundRendererProps {
    imageUrl?: string;
    opacity?: number;
    blur?: number;
    blendMode?: string;
}

export const SarakBackgroundRenderer: React.FC<SarakBackgroundRendererProps> = ({ 
    imageUrl, 
    opacity = 1, 
    blur = 0, 
    blendMode = 'normal' 
}) => {
    if (!imageUrl) return null;

    // Sanitiza a URL caso ainda venha com sintaxe CSS (url("..."))
    const rawUrl = typeof imageUrl === 'string' ? imageUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : imageUrl;
    
    const isVideo = rawUrl?.includes('video') || rawUrl?.endsWith('.webm') || rawUrl?.endsWith('.mp4');

    const style: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Logo acima do background principal do contêiner, mas atrás do conteúdo
        opacity: opacity,
        filter: `blur(${blur}px)`,
        mixBlendMode: blendMode as any,
        pointerEvents: 'none',
        overflow: 'hidden'
    };

    if (isVideo) {
        return (
            <div style={style}>
                <video 
                    src={rawUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            </div>
        );
    }

    return (
        <div style={{
            ...style,
            backgroundImage: `url("${rawUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }} />
    );
};
