import React from 'react';
import { useMediaLuminance } from '../hooks/useMediaLuminance';

interface SarakBackgroundRendererProps {
    imageUrl?: string;
    opacity?: number;
    blur?: number;
    blendMode?: string;
    isFixed?: boolean;
    mode?: 'light' | 'dark';
    disableOverlay?: boolean;
    zIndex?: number;
}

export const SarakBackgroundRenderer: React.FC<SarakBackgroundRendererProps> = ({ 
    imageUrl, 
    opacity = 1, 
    blur = 0, 
    blendMode = 'normal',
    isFixed = false,
    mode,
    disableOverlay = false,
    zIndex = -1
}) => {
    if (!imageUrl) return null;

    const rawUrl = typeof imageUrl === 'string' ? imageUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : imageUrl;
    const isVideo = rawUrl?.includes('video') || rawUrl?.endsWith('.webm') || rawUrl?.endsWith('.mp4');

    const isLightMode = mode === 'light';
    const luminance = useMediaLuminance(rawUrl, isVideo);

    // 1. Escudo de Simetria Absoluta
    // Os logs revelaram que o preset estava usando 'color-dodge'.
    // Em um sistema dual-theme, o fundo do container alterna entre Branco (#ffffff) e Preto (#0f0f11).
    // QUALQUER blend-mode que não seja 'normal' vai gerar um resultado matemático brutalmente diferente
    // entre claro e escuro (ex: color-dodge no claro = branco puro, no escuro = contraste extremo).
    // Para garantir a regra do usuário ("Não devemos inverter cores da midia base"), 
    // a base DEVE ser renderizada com blend-mode 'normal'.
    const safeBlendMode = 'normal';

    const containerStyle: React.CSSProperties = {
        position: isFixed ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: zIndex,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: 'var(--sarak-bg-body)'
    };

    const mediaStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        opacity: opacity,
        filter: `blur(${blur}px)`,
        mixBlendMode: safeBlendMode,
        objectFit: 'cover'
    };

    // Inteligência Condicional (Regra Exata Solicitada pelo Usuário)
    // A única diferença em relação à mídia base DEVE ser a camada de gradiente por cima.
    let showOverlay = false;
    let overlayColor = 'transparent';

    if (!disableOverlay && ((!isLightMode && luminance === 'light') || (isLightMode && luminance === 'dark'))) {
        // Oposto: aplica gradiente base do tema dinamicamente com fallback robusto
        showOverlay = true;
        const fallbackColor = isLightMode ? '#ffffff' : '#000000';
        overlayColor = `color-mix(in srgb, var(--sarak-bg-base, ${fallbackColor}) 85%, transparent)`;
    }
    // Se for 'unknown' (falha de CORS) ou se a imagem já combinar com o tema, 
    // NÃO aplicamos nenhum overlay para garantir zero alteração nas cores originais.

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 70% 30%, transparent 10%, ${overlayColor} 140%)`,
        zIndex: 1,
        pointerEvents: 'none',
        opacity: showOverlay ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
    };

    if (isVideo) {
        return (
            <div style={containerStyle}>
                <video src={rawUrl} autoPlay loop muted playsInline style={mediaStyle} />
                <div style={overlayStyle} />
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={{
                ...mediaStyle,
                backgroundImage: `url("${rawUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }} />
            <div style={overlayStyle} />
        </div>
    );
};
