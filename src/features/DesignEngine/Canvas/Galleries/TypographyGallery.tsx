import React from 'react';
import { motion } from 'framer-motion';
import { useSarakUI, UIContext } from '../../../../core/Provider/SarakUIProvider';
import { TYPO_PRESETS, TypoPreset } from '../../../../constants/typo-presets';
import { DESIGN_MANIFEST } from '../../../../core/Provider/SarakUIProvider';
import { Check, Type, Hash } from 'lucide-react';

interface TypographyGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const TypographyGallery: React.FC<TypographyGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="grid grid-cols-1 gap-8 p-8">
            {TYPO_PRESETS.map((preset) => (
                <TypoSpecimen 
                    key={preset.id} 
                    preset={preset} 
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.headingFont === preset.tokens.headingFont && tokens.scaleRatio === preset.tokens.scaleRatio}
                    globalTokens={tokens}
                />
            ))}
        </div>
    );
};

const getTypoVariables = (mergedTokens: any) => {
    const vars: any = {};
    
    Object.entries(mergedTokens).forEach(([key, value]) => {
        const config = (DESIGN_MANIFEST as any)[key];
        if (config && config.vars) {
            const transformedValue = config.transform ? config.transform(value) : value;
            config.vars.forEach((varName: string) => {
                vars[varName] = `${transformedValue}${config.unit || ''}`;
            });
        }
    });

    return vars;
};

const TypoSpecimen: React.FC<{ preset: TypoPreset; onSelect: () => void; isActive: boolean; globalTokens: any }> = ({ 
    preset, onSelect, isActive, globalTokens 
}) => {
    const mergedTokens = { ...globalTokens, ...preset.tokens };
    const vars = getTypoVariables(mergedTokens);

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            {/* Sandboxed Provider for Token Isolation */}
            <div style={vars as any} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Side: Large Visual Specimen */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-[var(--theme-primary)]' : 'bg-white/5'}`}>
                            <Type className={isActive ? 'text-white' : 'text-white/40'} size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-white">{preset.name}</h3>
                            <p className="text-2xs uppercase tracking-widest text-white/30">{preset.description}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-3xs font-black uppercase tracking-[0.2em] text-[var(--theme-primary)] opacity-60">Heading 1</div>
                        <h1 className="text-5xl font-black leading-tight text-white transition-all duration-700" style={{ fontFamily: mergedTokens.headingFont, fontWeight: mergedTokens.headingWeight, letterSpacing: `${mergedTokens.headingLetterSpacing}em` }}>
                            Sovereign <br /> Intelligence
                        </h1>
                    </div>

                    <div className="space-y-2 pt-4">
                        <div className="text-3xs font-black uppercase tracking-[0.2em] text-white/20">Body Paragraph</div>
                        <p className="text-xs leading-relaxed text-white/60 max-w-md" style={{ fontFamily: mergedTokens.bodyFont }}>
                            The Sarak ecosystem is built on the principle of absolute architectural sovereignty. 
                            Every component is a modular cell in a decentralized network of high-fidelity interfaces.
                        </p>
                    </div>
                </div>

                {/* Right Side: Technical Specs & UI Elements */}
                <div className="bg-black/20 rounded-2xl p-8 border border-white/5 space-y-8 self-center">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Tabular Data</span>
                            <div className="text-2xl font-black text-white" style={{ fontFamily: mergedTokens.headingFont, fontVariantNumeric: mergedTokens.useTabularNums ? 'tabular-nums' : 'normal' }}>
                                0123456789
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Scale Ratio</span>
                            <div className="text-2xl font-black text-[var(--theme-primary)]">
                                {mergedTokens.scaleRatio}x
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">UI Navigation Examples</span>
                        <div className="flex flex-wrap gap-3">
                            {['Overview', 'Security', 'Database', 'Network'].map((tab, i) => (
                                <div 
                                    key={tab} 
                                    className={`px-4 py-2 rounded-lg text-2xs font-black uppercase tracking-widest border transition-all ${
                                        i === 0 ? 'bg-[var(--theme-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 text-white/40'
                                    }`}
                                    style={{ fontFamily: mergedTokens.tabFont }}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Badge info */}
                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                            <Hash size={10} className="text-white/20" />
                            <span className="text-[10px] font-bold text-white/40 uppercase">{mergedTokens.headingWeight} Weight</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                            <Type size={10} className="text-white/20" />
                            <span className="text-[10px] font-bold text-white/40 uppercase">{mergedTokens.headingFont}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Marker */}
            {isActive && (
                <div className="absolute top-6 right-6">
                    <div className="w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40">
                        <Check className="text-white" size={12} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};
