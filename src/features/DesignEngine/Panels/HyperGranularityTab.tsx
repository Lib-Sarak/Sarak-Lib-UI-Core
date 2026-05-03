import React from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { 
    Layers, Box, Maximize, Palette, Waves, MousePointer2, 
    Sidebar, Layout, CreditCard, Type, Zap, Move, 
    Droplets, Grid3X3, CornerUpRight, Square, 
    CircleDashed, Sliders, Activity, Shield, Wind, 
    Monitor, Hash, Brush, Sparkles, Fingerprint
} from 'lucide-react';

import { Section, SliderControl, SelectControl, ColorControl, SwitchControl } from '../components/DesignControls';

export const HyperGranularityTab: React.FC = () => {
    const sarak = useSarakUI();
    const { applyConfig, ...design } = sarak;
    const [activeSection, setActiveSection] = React.useState<string | null>(null);

    const update = (key: string, val: any) => applyConfig({ [key]: val });

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto custom-scrollbar">
            
            {/* SOBERANIA DE CAMADAS (CORES) */}
            <Section id="sovereignty" title="Soberania de Camadas" icon={Palette} activeSection={activeSection} onToggle={setActiveSection}>
                <div className="space-y-8">
                    {/* System Colors */}
                    <div className="grid grid-cols-1 gap-4">
                        <label className="text-2xs font-black uppercase text-white/20">Cores do Sistema</label>
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Principal" value={design.primaryColor} onChange={(val: any) => update('primaryColor', val)} />
                            <ColorControl label="Secundária" value={design.secondaryColor} onChange={(val: any) => update('secondaryColor', val)} />
                            <ColorControl label="Terciária" value={design.tertiaryColor} onChange={(val: any) => update('tertiaryColor', val)} />
                            <ColorControl label="Accent" value={design.accentColor} onChange={(val: any) => update('accentColor', val)} />
                            <ColorControl label="Surface" value={design.surfaceColor} onChange={(val: any) => update('surfaceColor', val)} />
                            <ColorControl label="Texture" value={design.textureColor} onChange={(val: any) => update('textureColor', val)} />
                            <ColorControl label="Título" value={design.titleColor} onChange={(val: any) => update('titleColor', val)} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <ColorControl label="Error" value={design.errorColor} onChange={(val: any) => update('errorColor', val)} />
                            <ColorControl label="Success" value={design.successColor} onChange={(val: any) => update('successColor', val)} />
                            <ColorControl label="Warning" value={design.warningColor} onChange={(val: any) => update('warningColor', val)} />
                        </div>
                    </div>

                    {/* Sidebar Sovereignty */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Sidebar size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Barra Lateral (Sidebar)</span>
                        </div>
                        <ColorControl label="Fundo Base" value={design.sidebarColor} onChange={(val: any) => update('sidebarColor', val)} />
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Hover" value={design.sidebarHoverColor} onChange={(val: any) => update('sidebarHoverColor', val)} />
                            <ColorControl label="Active" value={design.sidebarActiveColor} onChange={(val: any) => update('sidebarActiveColor', val)} />
                        </div>
                        <SliderControl label="Noise Opacity" value={design.sidebarNoiseOpacity} onChange={(val: any) => update('sidebarNoiseOpacity', val)} min={0} max={1} step={0.01} unit="" />
                    </div>

                    {/* Topbar Sovereignty */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Barra Superior (Topbar)</span>
                        </div>
                        <ColorControl label="Fundo Base" value={design.topbarColor} onChange={(val: any) => update('topbarColor', val)} />
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Hover" value={design.topbarHoverColor} onChange={(val: any) => update('topbarHoverColor', val)} />
                            <ColorControl label="Active" value={design.topbarActiveColor} onChange={(val: any) => update('topbarActiveColor', val)} />
                        </div>
                        <SliderControl label="Noise Opacity" value={design.topbarNoiseOpacity} onChange={(val: any) => update('topbarNoiseOpacity', val)} min={0} max={1} step={0.01} unit="" />
                    </div>

                    {/* Card Sovereignty */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Cartões (Cards)</span>
                        </div>
                        <ColorControl label="Background" value={design.cardBackgroundColor} onChange={(val: any) => update('cardBackgroundColor', val)} />
                        <ColorControl label="Border" value={design.cardBorderColor} onChange={(val: any) => update('cardBorderColor', val)} />
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Hover" value={design.cardHoverColor} onChange={(val: any) => update('cardHoverColor', val)} />
                            <ColorControl label="Active" value={design.cardActiveColor} onChange={(val: any) => update('cardActiveColor', val)} />
                        </div>
                        <SliderControl label="Noise Opacity" value={design.cardNoiseOpacity} onChange={(val: any) => update('cardNoiseOpacity', val)} min={0} max={1} step={0.01} unit="" />
                    </div>

                    {/* Button Sovereignty */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <MousePointer2 size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Ações (Botões)</span>
                        </div>
                        <ColorControl label="Cor Base" value={design.buttonColor} onChange={(val: any) => update('buttonColor', val)} />
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Hover" value={design.buttonHoverColor} onChange={(val: any) => update('buttonHoverColor', val)} />
                            <ColorControl label="Active" value={design.buttonActiveColor} onChange={(val: any) => update('buttonActiveColor', val)} />
                        </div>
                    </div>
                </div>
            </Section>

            {/* GEOMETRIA INDUSTRIAL */}
            <Section title="Geometria Industrial" icon={Box}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <SliderControl label="Border Radius (Global)" value={design.borderRadius} onChange={(val: any) => update('borderRadius', val)} max={60} />
                        <div className="grid grid-cols-3 gap-4">
                            <SliderControl label="SM" value={design.borderRadiusSm} onChange={(val: any) => update('borderRadiusSm', val)} max={20} />
                            <SliderControl label="MD" value={design.borderRadiusMd} onChange={(val: any) => update('borderRadiusMd', val)} max={40} />
                            <SliderControl label="LG" value={design.borderRadiusLg} onChange={(val: any) => update('borderRadiusLg', val)} max={60} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <SliderControl label="Border Width" value={design.borderWidth} onChange={(val: any) => update('borderWidth', val)} max={10} />
                        <SelectControl 
                            label="Border Style" 
                            value={design.borderStyle || 'solid'} 
                            onChange={(val: any) => update('borderStyle', val)}
                            options={[
                                { label: 'Solid', value: 'solid' },
                                { label: 'Dashed', value: 'dashed' },
                                { label: 'Dotted', value: 'dotted' },
                                { label: 'Double', value: 'double' }
                            ]}
                        />
                        <SelectControl 
                            label="Tipo de Borda (Material)" 
                            value={design.borderType || 'standard'} 
                            onChange={(val: any) => update('borderType', val)}
                            options={[
                                { label: 'Standard', value: 'standard' },
                                { label: 'Glass', value: 'glass' },
                                { label: 'Neon', value: 'neon' },
                                { label: 'Soft', value: 'soft' }
                            ]}
                        />
                    </div>

                    <SwitchControl 
                        label="Border Beam" 
                        description="Efeito de feixe de luz nas bordas" 
                        value={design.borderBeamEnabled} 
                        onChange={(val: any) => update('borderBeamEnabled', val)} 
                    />
                    <SwitchControl 
                        label="Corte Geométrico" 
                        description="Bordas com cortes angulares" 
                        value={design.isGeometricCut} 
                        onChange={(val: any) => update('isGeometricCut', val)} 
                    />
                </div>
            </Section>

            {/* ESPAÇAMENTO ATÔMICO */}
            <Section title="Espaçamento Atômico" icon={Maximize}>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-2xs font-black uppercase text-white/20">Layout Gaps</label>
                        <SliderControl label="Gap (Base)" value={design.layoutGap} onChange={(val: any) => update('layoutGap', val)} max={64} />
                        <div className="grid grid-cols-3 gap-4">
                            <SliderControl label="SM" value={design.layoutGapSm} onChange={(val: any) => update('layoutGapSm', val)} max={20} />
                            <SliderControl label="MD" value={design.layoutGapMd} onChange={(val: any) => update('layoutGapMd', val)} max={40} />
                            <SliderControl label="LG" value={design.layoutGapLg} onChange={(val: any) => update('layoutGapLg', val)} max={80} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-2xs font-black uppercase text-white/20">Card Padding</label>
                        <SliderControl label="Padding (Base)" value={design.cardPadding} onChange={(val: any) => update('cardPadding', val)} max={80} />
                        <div className="grid grid-cols-3 gap-4">
                            <SliderControl label="SM" value={design.cardPaddingSm} onChange={(val: any) => update('cardPaddingSm', val)} max={32} />
                            <SliderControl label="MD" value={design.cardPaddingMd} onChange={(val: any) => update('cardPaddingMd', val)} max={48} />
                            <SliderControl label="LG" value={design.cardPaddingLg} onChange={(val: any) => update('cardPaddingLg', val)} max={96} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <SliderControl label="Tab Gap" value={design.tabGap} onChange={(val: any) => update('tabGap', val)} max={40} />
                        <SliderControl label="Tab Section Margin" value={design.tabSectionMargin} onChange={(val: any) => update('tabSectionMargin', val)} max={60} />
                    </div>
                </div>
            </Section>

            {/* ATMOSFERA & TEXTURA */}
            <Section title="Atmosfera & Textura" icon={Waves}>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-2xs font-black uppercase text-white/20">Efeito Glassmorphism</label>
                        <SliderControl label="Glass Opacity" value={design.glassOpacity} onChange={(val: any) => update('glassOpacity', val)} min={0} max={1} step={0.01} unit="" />
                        <SliderControl label="Glass Blur" value={design.glassBlur} onChange={(val: any) => update('glassBlur', val)} max={40} />
                        <SliderControl label="Glass Saturation" value={design.glassSaturation} onChange={(val: any) => update('glassSaturation', val)} min={0} max={300} unit="%" />
                    </div>

                    <div className="space-y-4">
                        <label className="text-2xs font-black uppercase text-white/20">Sombra & Profundidade</label>
                        <SliderControl label="Shadow Intensity" value={design.shadowIntensity} onChange={(val: any) => update('shadowIntensity', val)} min={0} max={2} step={0.1} unit="" />
                        <SliderControl label="Layered Shadows" value={design.layeredShadows} onChange={(val: any) => update('layeredShadows', val)} min={0} max={3} step={0.1} unit="" />
                        <SelectControl 
                            label="Shadow Orientation" 
                            value={design.shadowOrientation || 'bottom'} 
                            onChange={(val: any) => update('shadowOrientation', val)}
                            options={[
                                { label: 'Bottom', value: 'bottom' },
                                { label: 'Center', value: 'center' },
                                { label: 'Top', value: 'top' },
                                { label: 'Float', value: 'float' }
                            ]}
                        />
                        <SelectControl 
                            label="Shadow Color Mode" 
                            value={design.shadowColorMode || 'neutral'} 
                            onChange={(val: any) => update('shadowColorMode', val)}
                            options={[
                                { label: 'Neutral', value: 'neutral' },
                                { label: 'Primary Tint', value: 'primary' },
                                { label: 'Deep Black', value: 'black' }
                            ]}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-2xs font-black uppercase text-white/20">Textura de Fundo</label>
                        <SliderControl label="Atmosphere Noise" value={design.atmosphereNoiseOpacity} onChange={(val: any) => update('atmosphereNoiseOpacity', val)} min={0} max={1} step={0.01} unit="" />
                        <SliderControl label="Global Texture Opacity" value={design.textureOpacity} onChange={(val: any) => update('textureOpacity', val)} min={0} max={1} step={0.01} unit="" />
                    </div>

                    <div className="space-y-4">
                        <label className="text-2xs font-black uppercase text-white/20">Iluminação Dinâmica</label>
                        <SwitchControl 
                            label="Spotlight" 
                            description="Efeito de holofote que segue o mouse" 
                            value={design.spotlightEnabled} 
                            onChange={(val: any) => update('spotlightEnabled', val)} 
                        />
                        <SliderControl label="Card Spotlight Intensity" value={design.cardSpotlight} onChange={(val: any) => update('cardSpotlight', val)} min={0} max={1} step={0.05} unit="" />
                    </div>
                </div>
            </Section>

            {/* TIPOGRAFIA */}
            <Section title="Tipografia Industrial" icon={Type}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <SelectControl 
                            label="Heading Font" 
                            value={design.headingFont || 'Inter'} 
                            onChange={(val: any) => update('headingFont', val)}
                            options={[
                                { label: 'Inter', value: 'Inter' },
                                { label: 'Outfit', value: 'Outfit' },
                                { label: 'Roboto', value: 'Roboto' },
                                { label: 'Space Grotesk', value: 'Space Grotesk' },
                                { label: 'JetBrains Mono', value: 'JetBrains Mono' }
                            ]}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <SelectControl 
                                label="Heading Weight" 
                                value={design.headingWeight || '700'} 
                                onChange={(val: any) => update('headingWeight', val)}
                                options={[
                                    { label: '300 Light', value: '300' },
                                    { label: '400 Regular', value: '400' },
                                    { label: '600 SemiBold', value: '600' },
                                    { label: '700 Bold', value: '700' },
                                    { label: '900 Black', value: '900' }
                                ]}
                            />
                            <SelectControl 
                                label="Letter Spacing" 
                                value={design.headingLetterSpacing || 'normal'} 
                                onChange={(val: any) => update('headingLetterSpacing', val)}
                                options={[
                                    { label: 'Tight', value: 'tight' },
                                    { label: 'Normal', value: 'normal' },
                                    { label: 'Wide', value: 'wide' },
                                    { label: 'Widest', value: 'widest' }
                                ]}
                            />
                        </div>
                    </div>

                    <SelectControl 
                        label="Body Font" 
                        value={design.bodyFont || 'Inter'} 
                        onChange={(val: any) => update('bodyFont', val)}
                        options={[
                            { label: 'Inter', value: 'Inter' },
                            { label: 'Outfit', value: 'Outfit' },
                            { label: 'Roboto', value: 'Roboto' },
                            { label: 'Space Grotesk', value: 'Space Grotesk' }
                        ]}
                    />

                    <div className="grid grid-cols-1 gap-4">
                        <SelectControl 
                            label="Font Scale (PP - GG)" 
                            value={design.fontScale || 'm'} 
                            onChange={(val: any) => update('fontScale', val)}
                            options={[
                                { label: 'Micro (PP)', value: 'pp' },
                                { label: 'Small (P)', value: 'p' },
                                { label: 'Medium (M)', value: 'm' },
                                { label: 'Large (G)', value: 'g' },
                                { label: 'Extra (GG)', value: 'gg' }
                            ]}
                        />
                        <SliderControl label="Fluid Scaling Factor" value={design.fluidScaling} onChange={(val: any) => update('fluidScaling', val)} min={0.5} max={2} step={0.1} unit="" />
                        <SwitchControl 
                            label="Tabular Nums" 
                            description="Números com largura fixa" 
                            value={design.useTabularNums} 
                            onChange={(val: any) => update('useTabularNums', val)} 
                        />
                    </div>
                </div>
            </Section>

            {/* DINÂMICA */}
            <Section title="Dinâmica & Resposta" icon={Zap}>
                <div className="space-y-6">
                    <SliderControl label="Animation Speed" value={design.animationSpeed} onChange={(val: any) => update('animationSpeed', val)} min={0} max={2} step={0.05} unit="s" />
                    <SliderControl label="Interface Elasticity" value={design.interfaceElasticity} onChange={(val: any) => update('interfaceElasticity', val)} min={0} max={1} step={0.01} unit="" />
                    
                    <div className="grid grid-cols-1 gap-4">
                        <SwitchControl 
                            label="Magnetic Pull" 
                            description="Elementos que atraem o cursor" 
                            value={design.magneticPullEnabled} 
                            onChange={(val: any) => update('magneticPullEnabled', val)} 
                        />
                        <SwitchControl 
                            label="Hover Lift" 
                            description="Elevação suave no hover" 
                            value={design.hoverLiftEnabled} 
                            onChange={(val: any) => update('hoverLiftEnabled', val)} 
                        />
                        <SliderControl label="Haptic Intensity" value={design.hapticIntensity} onChange={(val: any) => update('hapticIntensity', val)} min={0} max={0.1} step={0.01} unit="" />
                    </div>

                    <SelectControl 
                        label="Performance Mode" 
                        value={design.performanceMode || 'standard'} 
                        onChange={(val: any) => update('performanceMode', val)}
                        options={[
                            { label: 'Standard', value: 'standard' },
                            { label: 'High Quality', value: 'high' },
                            { label: 'Battery Saver', value: 'low' },
                            { label: 'Static (No Anim)', value: 'static' }
                        ]}
                    />
                </div>
            </Section>

            {/* CONFIGURAÇÕES DE LAYOUT */}
            <Section title="Arquitetura de Layout" icon={Monitor}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <SliderControl label="Sidebar Width" value={design.sidebarWidth} onChange={(val: any) => update('sidebarWidth', val)} min={180} max={500} unit="px" />
                        <div className="grid grid-cols-2 gap-4">
                            <SliderControl label="Min Width" value={design.sidebarMinWidth} onChange={(val: any) => update('sidebarMinWidth', val)} min={150} max={300} unit="px" />
                            <SliderControl label="Max Width" value={design.sidebarMaxWidth} onChange={(val: any) => update('sidebarMaxWidth', val)} min={300} max={800} unit="px" />
                        </div>
                    </div>

                    <SliderControl label="Logo Scale" value={design.logoScale} onChange={(val: any) => update('logoScale', val)} min={0.5} max={2.0} step={0.1} unit="" />
                    <SliderControl label="Max Content Width" value={design.maxContentWidth} onChange={(val: any) => update('maxContentWidth', val)} min={800} max={2500} step={50} unit="px" />
                    <SliderControl label="Scrollbar Width" value={design.scrollbarStyle} onChange={(val: any) => update('scrollbarStyle', val)} min={0} max={12} unit="px" />
                    
                    <SwitchControl 
                        label="Auto-Hide Navigation" 
                        description="Esconde menu lateral automaticamente" 
                        value={design.isAutoHideEnabled} 
                        onChange={(val: any) => update('isAutoHideEnabled', val)} 
                    />
                </div>
            </Section>

            <div className="p-8 mt-auto">
                <div className="p-4 rounded-2xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-center">
                    <span className="text-3xs font-black uppercase tracking-[0.4em] text-[var(--theme-primary)]">Sovereign Granularity v10.3</span>
                </div>
            </div>
        </div>
    );
};

export default HyperGranularityTab;
