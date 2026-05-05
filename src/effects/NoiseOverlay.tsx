import React from 'react';

/**
 * NoiseOverlay Component (Industrial Excellence Phase v8.0)
 * Renders a sovereign grain texture using an SVG filter.
 */
export const NoiseOverlay: React.FC = () => {
    const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;

    return (
        <div 
            className="fixed inset-0 pointer-events-none z-[9999] opacity-[var(--sarak-noise-opacity,0)] transition-opacity duration-1000"
            style={{ 
                mixBlendMode: 'overlay',
                backgroundImage: `url("${noiseSvg}")`,
                backgroundSize: '200px 200px',
                backgroundRepeat: 'repeat'
            }}
        />
    );
};

