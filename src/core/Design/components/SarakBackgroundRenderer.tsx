import React from 'react';

interface SarakBackgroundRendererProps {
    imageUrl?: string;
    opacity?: number;
    blur?: number;
    blendMode?: string;
    isFixed?: boolean;
    mode?: 'light' | 'dark';
}

export const SarakBackgroundRenderer: React.FC<SarakBackgroundRendererProps> = ({ 
    imageUrl, 
    opacity = 1, 
    blur = 0, 
    blendMode = 'normal',
    isFixed = false,
    mode
}) => {
    if (!imageUrl) return null;

    // Sanitiza a URL caso ainda venha com sintaxe CSS (url("..."))
    const rawUrl = typeof imageUrl === 'string' ? imageUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : imageUrl;
    
    const isVideo = rawUrl?.includes('video') || rawUrl?.endsWith('.webm') || rawUrl?.endsWith('.mp4');

    // Proteção para Light Mode: Modos de mesclagem como 'screen' ou 'color-dodge' desaparecem no fundo branco.
    // Usamos a prop `mode` para evitar race conditions com a atualização assíncrona da classList do body no React.
    const isLightMode = mode === 'light';
    const safeBlendMode = isLightMode && ['screen', 'color-dodge', 'lighten', 'plus-lighter'].includes(blendMode) 
        ? 'multiply' 
        : blendMode;
    
    // Pequeno boost na opacidade se for muito baixa no modo claro (já que perde contraste)
    const safeOpacity = (isLightMode && opacity < 0.2) ? Math.min(opacity * 1.5, 1) : opacity;

    const style: React.CSSProperties = {
        position: isFixed ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Sempre atrás de todo o conteúdo da aplicação/container
        opacity: safeOpacity,
        filter: `blur(${blur}px)`,
        mixBlendMode: safeBlendMode as any,
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
