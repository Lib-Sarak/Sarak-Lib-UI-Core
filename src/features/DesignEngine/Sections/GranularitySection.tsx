import React from 'react';
import { 
    Palette, Box, Maximize, Waves, MousePointer2, 
    Sidebar, Layout, CreditCard, Type, Zap, 
    Monitor
} from 'lucide-react';
import { Section, SliderControl, SelectControl, ColorControl, SwitchControl } from '../components/DesignControls';

interface GranularitySectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const GranularitySection: React.FC<GranularitySectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            {/* 1. SOBERANIA DE CORES */}
            <Section id="granular-colors" icon={Palette} title="Soberania de Cores" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Sidebar size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Barra Lateral (Sidebar)</span>
                        </div>
                        <ColorControl label="Fundo Base" value={draft.sidebarColor} onChange={(v: any) => updateDraft('sidebarColor', v)} />
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Hover" value={draft.sidebarHoverColor} onChange={(v: any) => updateDraft('sidebarHoverColor', v)} />
                            <ColorControl label="Active" value={draft.sidebarActiveColor} onChange={(v: any) => updateDraft('sidebarActiveColor', v)} />
                        </div>
                        <SliderControl label="Noise Opacity" value={draft.sidebarNoiseOpacity} onChange={(v: any) => updateDraft('sidebarNoiseOpacity', v)} min={0} max={0.5} step={0.01} unit="%" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Barra Superior (Topbar)</span>
                        </div>
                        <ColorControl label="Fundo Base" value={draft.topbarColor} onChange={(v: any) => updateDraft('topbarColor', v)} />
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Hover" value={draft.topbarHoverColor} onChange={(v: any) => updateDraft('topbarHoverColor', v)} />
                            <ColorControl label="Active" value={draft.topbarActiveColor} onChange={(v: any) => updateDraft('topbarActiveColor', v)} />
                        </div>
                        <SliderControl label="Noise Opacity" value={draft.topbarNoiseOpacity} onChange={(v: any) => updateDraft('topbarNoiseOpacity', v)} min={0} max={0.5} step={0.01} unit="%" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Cartões (Cards)</span>
                        </div>
                        <ColorControl label="Background" value={draft.cardBackgroundColor} onChange={(v: any) => updateDraft('cardBackgroundColor', v)} />
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Hover" value={draft.cardHoverColor} onChange={(v: any) => updateDraft('cardHoverColor', v)} />
                            <ColorControl label="Active" value={draft.cardActiveColor} onChange={(v: any) => updateDraft('cardActiveColor', v)} />
                        </div>
                        <SliderControl label="Noise Opacity" value={draft.cardNoiseOpacity} onChange={(v: any) => updateDraft('cardNoiseOpacity', v)} min={0} max={0.5} step={0.01} unit="%" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <MousePointer2 size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Ações (Botões)</span>
                        </div>
                        <ColorControl label="Cor Base" value={draft.buttonColor} onChange={(v: any) => updateDraft('buttonColor', v)} />
                        <div className="grid grid-cols-2 gap-3">
                            <ColorControl label="Hover" value={draft.buttonHoverColor} onChange={(v: any) => updateDraft('buttonHoverColor', v)} />
                            <ColorControl label="Active" value={draft.buttonActiveColor} onChange={(v: any) => updateDraft('buttonActiveColor', v)} />
                        </div>
                    </div>
                </div>
            </Section>

            {/* 2. GEOMETRIA INDUSTRIAL */}
            <Section id="granular-geometry" icon={Box} title="Geometria Industrial" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="space-y-6">
                    <SliderControl label="Border Radius (Global)" value={draft.borderRadius} onChange={(v: any) => updateDraft('borderRadius', v)} max={60} />
                    <div className="grid grid-cols-3 gap-2">
                        <SliderControl label="SM" value={draft.borderRadiusSm} onChange={(v: any) => updateDraft('borderRadiusSm', v)} max={20} />
                        <SliderControl label="MD" value={draft.borderRadiusMd} onChange={(v: any) => updateDraft('borderRadiusMd', v)} max={40} />
                        <SliderControl label="LG" value={draft.borderRadiusLg} onChange={(v: any) => updateDraft('borderRadiusLg', v)} max={60} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <SliderControl label="Border Width" value={draft.borderWidth} onChange={(v: any) => updateDraft('borderWidth', v)} max={10} />
                        <SelectControl 
                            label="Border Style" 
                            value={draft.borderStyle} 
                            onChange={(v: any) => updateDraft('borderStyle', v)}
                            options={[
                                { label: 'Solid', value: 'solid' },
                                { label: 'Dashed', value: 'dashed' },
                                { label: 'Dotted', value: 'dotted' }
                            ]}
                        />
                    </div>

                    <SwitchControl 
                        label="Corte Geométrico" 
                        description="Bordas com cortes angulares" 
                        value={draft.isGeometricCut} 
                        onChange={(v: any) => updateDraft('isGeometricCut', v)} 
                    />
                </div>
            </Section>

            {/* 3. ESPAÇAMENTO ATÔMICO */}
            <Section id="granular-spacing" icon={Maximize} title="Espaçamento Atômico" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="space-y-6">
                    <SliderControl label="Gap (Base)" value={draft.layoutGap} onChange={(v: any) => updateDraft('layoutGap', v)} max={64} />
                    <div className="grid grid-cols-3 gap-2">
                        <SliderControl label="SM" value={draft.layoutGapSm} onChange={(v: any) => updateDraft('layoutGapSm', v)} max={20} />
                        <SliderControl label="MD" value={draft.layoutGapMd} onChange={(v: any) => updateDraft('layoutGapMd', v)} max={40} />
                        <SliderControl label="LG" value={draft.layoutGapLg} onChange={(v: any) => updateDraft('layoutGapLg', v)} max={80} />
                    </div>

                    <SliderControl label="Padding (Base)" value={draft.cardPadding} onChange={(v: any) => updateDraft('cardPadding', v)} max={80} />
                    <div className="grid grid-cols-3 gap-2">
                        <SliderControl label="SM" value={draft.cardPaddingSm} onChange={(v: any) => updateDraft('cardPaddingSm', v)} max={32} />
                        <SliderControl label="MD" value={draft.cardPaddingMd} onChange={(v: any) => updateDraft('cardPaddingMd', v)} max={48} />
                        <SliderControl label="LG" value={draft.cardPaddingLg} onChange={(v: any) => updateDraft('cardPaddingLg', v)} max={96} />
                    </div>
                </div>
            </Section>

            {/* 4. ATMOSFERA & PERFORMANCE */}
            <Section id="granular-atmos" icon={Waves} title="Atmosfera & Resposta" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="space-y-6">
                    <SliderControl label="Glass Opacity" value={draft.glassOpacity} onChange={(v: any) => updateDraft('glassOpacity', v)} min={0} max={1} step={0.01} />
                    <SliderControl label="Glass Blur" value={draft.glassBlur} onChange={(v: any) => updateDraft('glassBlur', v)} max={40} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <SliderControl label="Anim Speed" value={draft.animationSpeed} onChange={(v: any) => updateDraft('animationSpeed', v)} min={0} max={2} step={0.05} />
                        <SliderControl label="Elasticity" value={draft.interfaceElasticity} onChange={(v: any) => updateDraft('interfaceElasticity', v)} min={0} max={1} step={0.01} />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <SwitchControl 
                            label="Spotlight" 
                            description="Efeito de holofote no cursor" 
                            value={draft.spotlightEnabled} 
                            onChange={(v: any) => updateDraft('spotlightEnabled', v)} 
                        />
                        <SwitchControl 
                            label="Magnetic Pull" 
                            description="Elementos que atraem o cursor" 
                            value={draft.magneticPullEnabled} 
                            onChange={(v: any) => updateDraft('magneticPullEnabled', v)} 
                        />
                    </div>
                </div>
            </Section>
        </>
    );
};
