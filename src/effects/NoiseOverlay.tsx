import React from 'react';

/**
 * NoiseOverlay Component (Industrial Excellence Phase v8.0)
 * Renders a sovereign grain texture using an SVG filter.
 */
export const NoiseOverlay: React.FC = () => {
    return (
        <div 
            className="fixed inset-0 pointer-events-none z-[9999] opacity-[var(--sarak-noise-opacity,0)] transition-opacity duration-1000"
            style={{ mixBlendMode: 'overlay' }}
        >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <filter id="noiseFilter">
                    <feTurbulence 
                        type="fractalNoise" 
                        baseFrequency="0.65" 
                        numOctaves="3" 
                        stitchTiles="stitch" 
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
};

