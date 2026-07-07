import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';

interface ButtonPresetPreviewProps {
    preset: ComponentPreset;
    index: number;
    onApply: () => void;
    currentMode: string;
}

export const ButtonPresetPreview: React.FC<ButtonPresetPreviewProps> = ({ preset, index, onApply }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Leitura direta dos tokens do preset
    const d = preset.design;
    const styleType = String(d.btnStyleType || 'matte');
    const borderRadius = d.btnBorderRadius !== undefined ? String(d.btnBorderRadius) : 'var(--sarak-layout-gap-sm, 8px)';
    const glowColor = String(d.btnNeonGlowColor || 'rgba(0, 242, 255, 0.4)');
    const blurAmount = Number(d.btnBackdropBlur || 0);
    const primaryBg = String(d.btnPrimaryBg || 'var(--theme-primary)');
    const primaryText = String(d.btnPrimaryText || 'var(--color-theme-title,#ffffff)');

    // Construir estilo dinâmico como o SarakButton
    const dynamicStyle: React.CSSProperties = {
        padding: 'var(--sarak-preset-preview-padding-y, 12px) var(--sarak-layout-gap-lg, 24px)',
        fontSize: 'var(--color-theme-text, #ffffff)',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 'var(--sarak-tracking-subtle, 0.1em)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius,
        color: primaryText,
    };

    const applyStyles: Record<string, () => void> = {
        'neon': () => {
            dynamicStyle.backgroundColor = primaryBg;
            dynamicStyle.boxShadow = isHovered
                ? `0 0 var(--sarak-preset-glow-shadow-blur, 20px) ${glowColor}, inset 0 0 var(--sarak-preset-card-shadow-blur, 10px) ${glowColor}`
                : `0 0 var(--sarak-preset-card-shadow-blur, 10px) ${glowColor}`;
            dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${glowColor}`;
        },
        'frosted': () => {
            dynamicStyle.backgroundColor = primaryBg;
            dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
            dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
            dynamicStyle.border = 'var(--sarak-border-width, 1px) solid rgba(255,255,255,0.1)';
            dynamicStyle.boxShadow = '0 var(--sarak-layout-gap-sm, 8px) var(--sarak-preset-glow-shadow-blur-lg, 32px) 0 rgba(0, 0, 0, 0.3)';
        },
        'borderline': () => {
            dynamicStyle.backgroundColor = isHovered ? primaryBg : 'transparent';
            dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${primaryBg}`;
            dynamicStyle.color = isHovered ? 'var(--color-theme-primary, #00f2ff)' : primaryText;
        },
        'matte': () => {
            dynamicStyle.backgroundColor = primaryBg;
            dynamicStyle.boxShadow = `0 var(--sarak-preset-card-hover-shadow-offset-y, 10px) var(--sarak-preset-matte-shadow-blur1, 15px) calc(var(--sarak-preset-matte-shadow-spread1, 3px) * -1) rgba(0,0,0,0.2), 0 var(--sarak-preset-matte-shadow-offset-y2, 4px) var(--sarak-preset-matte-shadow-blur2, 6px) calc(var(--sarak-preset-matte-shadow-spread2, 4px) * -1) rgba(0,0,0,0.2)`;
            dynamicStyle.border = 'none';
        }
    };

    const strategy = applyStyles[styleType] || applyStyles['matte'];
    strategy();

    // Hover scale
    if (isHovered) {
        dynamicStyle.transform = 'scale(1.02)';
    }

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={onApply}
            className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border border-theme-border overflow-hidden bg-[rgba(10,10,10,0.5)] hover:border-theme-primary transition-all duration-300"
            style={{ minHeight: 'var(--sarak-preset-preview-min-height, 320px)' }}
        >
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-50"></div>
            
            <div className="relative z-10 flex items-center justify-center w-full h-full mb-6">
                <div 
                    style={dynamicStyle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {preset.name}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-4 bg-black/40 backdrop-blur-md border-t border-white/5 z-20 text-left">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">{preset.name}</h3>
                <p className="text-[var(--sarak-type-scale3xs,9px)] text-white/50 mt-1 uppercase tracking-widest leading-relaxed">{preset.description}</p>
            </div>
        </motion.button>
    );
};
