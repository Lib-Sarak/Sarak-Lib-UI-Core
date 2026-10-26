import React from 'react';
import { motion } from 'framer-motion';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';

interface InputPresetPreviewProps {
    preset: ComponentPreset;
    index: number;
    onApply: () => void;
    currentMode: string;
}

export const InputPresetPreview: React.FC<InputPresetPreviewProps> = ({ preset, index, onApply, currentMode }) => {
    const styles: React.CSSProperties = {};
    Object.entries(preset.design).forEach(([key, value]) => {
        if (key === 'inputBorderRadius') styles.borderRadius = String(value);
        if (key === 'inputBg') styles.backgroundColor = String(value);
        if (key === 'inputBorderColor') styles.borderColor = String(value);
        if (key === 'inputBorderType') {
            const borderStyles: Record<string, () => void> = {
                'none': () => { styles.borderWidth = 0; },
                'underline': () => {
                    styles.borderWidth = '0 0 var(--sarak-border-width, 1px) 0';
                    styles.borderStyle = 'solid';
                }
            };
            
            if (borderStyles[String(value)]) {
                borderStyles[String(value)]();
            } else {
                styles.borderStyle = String(value);
                styles.borderWidth = 'var(--border-color,rgba(255,255,255,0.09))';
            }
        }
        if (key === 'inputShadow') styles.boxShadow = String(value);
        if (key === 'inputBackdropBlur' && Number(value) > 0) {
            styles.backdropFilter = `blur(${Number(value)}px)`;
            styles.WebkitBackdropFilter = `blur(${Number(value)}px)`;
        }
    });

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={onApply}
            className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border border-theme-border overflow-hidden bg-[color-mix(in_srgb,var(--color-theme-body,#06080d)_50%,transparent)] hover:border-theme-primary hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.2)] transition-all duration-[var(--sarak-motion-dur-normal,0.3s)]"
            style={{ minHeight: 'var(--sarak-preset-preview-min-height, 320px)' }}
        >
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-theme-text)_5%,transparent)_0%,transparent_70%)] opacity-50"></div>
            
            <div className="relative z-10 flex items-center justify-center w-full h-full px-4 mb-6 pointer-events-none">
                <input 
                    type="text"
                    placeholder="Type here..."
                    readOnly
                    style={{
                        padding: 'var(--sarak-preset-preview-padding-y, 12px) var(--sarak-layout-gap-md, 16px)',
                        fontSize: 'var(--color-theme-text, #f2f6fb)',
                        width: '100%',
                        color: 'var(--color-theme-on-primary, #020617)',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        ...styles
                    }}
                    className="group-hover:scale-105 transition-transform"
                />
            </div>

            <div className="absolute bottom-0 left-0 w-full p-4 bg-theme-body/40 backdrop-blur-md border-t border-theme-text/5 z-20 text-left">
                <h3 className="text-xs font-black text-theme-text uppercase tracking-wider">{preset.name}</h3>
                <p className="text-[var(--sarak-type-scale3xs,11px)] text-theme-text/50 mt-1 uppercase tracking-widest leading-relaxed">{preset.description}</p>
            </div>
        </motion.button>
    );
};
