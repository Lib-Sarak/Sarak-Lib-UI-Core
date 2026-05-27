import React, { useState, useEffect } from 'react';

interface SarakBackgroundRendererProps {
    imageUrl?: string;
    opacity?: number;
    blur?: number;
    blendMode?: string;
    isFixed?: boolean;
    mode?: 'light' | 'dark';
}

// Hook de Inteligência Visual (Analisa a luminância real da imagem)
const useMediaLuminance = (url: string | undefined, isVideo: boolean) => {
    const [luminance, setLuminance] = useState<'light' | 'dark' | 'unknown'>('unknown');

    useEffect(() => {
        if (!url || isVideo) {
            setLuminance('unknown');
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous'; // Essencial para burlar CORS em CDNs como Unsplash
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return;
                
                // Amostragem ultra rápida de 50x50 pixels
                canvas.width = 50;
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);
                
                const imageData = ctx.getImageData(0, 0, 50, 50);
                const data = imageData.data;
                let r = 0, g = 0, b = 0;
                
                for (let i = 0, l = data.length; i < l; i += 4) {
                    r += data[i];
                    g += data[i+1];
                    b += data[i+2];
                }
                
                const pixelCount = data.length / 4;
                r = r / pixelCount;
                g = g / pixelCount;
                b = b / pixelCount;
                
                // Equação HSP (Highly Sensitive Perceived luminance)
                const hsp = Math.sqrt(
                    0.299 * (r * r) +
                    0.587 * (g * g) +
                    0.114 * (b * b)
                );
                
                // 127.5 é o ponto de equilíbrio matemático entre claro e escuro
                setLuminance(hsp > 127.5 ? 'light' : 'dark');
            } catch (e) {
                // Se o servidor da imagem bloquear o CORS, caímos num graceful fallback
                setLuminance('unknown');
            }
        };
        img.src = url;
    }, [url, isVideo]);

    return luminance;
};

export const SarakBackgroundRenderer: React.FC<SarakBackgroundRendererProps> = ({ 
    imageUrl, 
    opacity = 1, 
    blur = 0, 
    blendMode = 'normal',
    isFixed = false,
    mode
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
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: 'var(--sarak-bg-body)'
    };

    const mediaStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        opacity: opacity,
        filter: `blur(${blur}px)`,
        mixBlendMode: safeBlendMode as any,
        objectFit: 'cover'
    };

    // Inteligência Condicional (Regra Exata Solicitada pelo Usuário)
    // A única diferença em relação à mídia base DEVE ser a camada de gradiente por cima.
    let showOverlay = false;
    let overlayColor = 'transparent';

    if (!isLightMode && luminance === 'light') {
        // Tema escuro + Imagem clara -> Aplica gradiente escuro
        showOverlay = true;
        overlayColor = 'rgba(0, 0, 0, 0.85)';
    } else if (isLightMode && luminance === 'dark') {
        // Tema claro + Imagem escura -> Aplica gradiente claro
        showOverlay = true;
        overlayColor = 'rgba(255, 255, 255, 0.85)';
    } 

    // LOGS PROFUNDOS PARA INVESTIGAÇÃO (Solicitado pelo Usuário)
    console.groupCollapsed(`[SarakBackgroundRenderer] Debug: ${rawUrl?.substring(0, 30)}...`);
    console.log(`Theme: ${isLightMode ? 'LIGHT' : 'DARK'}`);
    console.log(`Image Detected Luminance: ${luminance}`);
    console.log(`Original BlendMode: ${blendMode}`);
    console.log(`Safe (Applied) BlendMode: ${safeBlendMode}`);
    console.log(`Opacity: ${opacity}`);
    console.log(`Overlay Applied: ${showOverlay}`);
    console.log(`Overlay Color: ${overlayColor}`);
    console.log(`Container Background: var(--sarak-bg-body)`);
    console.groupEnd();

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
