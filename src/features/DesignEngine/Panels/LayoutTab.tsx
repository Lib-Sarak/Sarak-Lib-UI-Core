import React from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
const THEME_FONTS = [{ id: 'outfit', value: "'Outfit', sans-serif", name: 'Outfit', category: 'Sans-Serif' }, { id: 'inter', value: "'Inter', sans-serif", name: 'Inter', category: 'Sans-Serif' }];
import { Maximize2, Minimize2, Type, Layout as LayoutIcon, Sidebar as SidebarIcon, ArrowRightLeft, CaseSensitive } from 'lucide-react';
import { SarakSlider, SarakSelect } from '../../../components/atomic/Inputs';

export const LayoutTab: React.FC = () => {
    const sarak = useSarakUI();
    const { 
        layoutDensity, fontScale, navigationStyle, 
        sidebarWidth, headingFont, bodyFont 
    } = sarak;

    const setLayoutDensity = (val: string) => sarak.applyConfig({ layoutDensity: val });
    const setFontScale = (val: string) => sarak.applyConfig({ fontScale: val });
    const setNavigationStyle = (val: string) => sarak.applyConfig({ navigationStyle: val });
    const setSidebarWidth = (val: number) => sarak.applyConfig({ sidebarWidth: val });
    const setHeadingFont = (val: string) => sarak.applyConfig({ headingFont: val });
    const setBodyFont = (val: string) => sarak.applyConfig({ bodyFont: val });

    const densities = [
        { id: 'compact', label: 'Compacto', icon: Minimize2, desc: 'Ideal para dashboards densos' },
        { id: 'standard', label: 'Padrão', icon: Maximize2, desc: 'Equilíbrio entre foco e espaço' },
        { id: 'comfortable', label: 'Confortável', icon: Maximize2, desc: 'Espaçamento generoso e relaxante' },
    ];

    const scales = [
        { id: 'p1', label: 'XS' },
        { id: 'p', label: 'S' },
        { id: 'm', label: 'M' },
        { id: 'g', label: 'L' },
        { id: 'g1', label: 'XL' },
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* DENSIDADE */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <LayoutIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-white/90">Densidade da Interface</h3>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {densities.map((d) => (
                            <button
                                key={d.id}
                                onClick={() => setLayoutDensity(d.id)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group ${layoutDensity === d.id 
                                    ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                            >
                                <div className={`p-3 rounded-xl transition-all ${layoutDensity === d.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40'}`}>
                                    <d.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xs font-black uppercase tracking-widest mb-1">{d.label}</div>
                                    <div className="text-2xs text-white/40 font-medium">{d.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ESCALA & TIPOGRAFIA */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Type className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-white/90">Escala Visual (Fator S)</h3>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-8">
                        <div className="flex justify-between items-end h-16 px-4">
                            {scales.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setFontScale(s.id)}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-1 bg-gradient-to-t from-indigo-500 to-blue-400 transition-all duration-500 rounded-full ${fontScale === s.id ? 'h-12 opacity-100 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'h-4 opacity-20'}`} />
                                    <span className={`text-2xs font-black transition-all ${fontScale === s.id ? 'text-white' : 'text-white/20'}`}>{s.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-2xs text-center text-white/30 uppercase font-black tracking-widest italic">Ajuste o multiplicador de escala do OS</p>
                    </div>

                    {/* Dimensões da Sidebar */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center text-2xs font-black uppercase text-white/30 mb-2">
                            <div className="flex items-center gap-2">
                                <SidebarIcon className="w-4 h-4 text-white/40" />
                                <span className="text-2xs font-black uppercase tracking-widest text-white/60">Largura Lateral</span>
                            </div>
                        </div>
                        <SarakSlider 
                            min={200} max={400} step={5}
                            value={sidebarWidth}
                            valueLabel={`${sidebarWidth}px`}
                            onChange={(e) => setSidebarWidth(parseInt(e.target.value))}
                        />
                    </div>

                    {/* FONTES INDEPENDENTES (PARIDADE 100%) */}
                    <div className="space-y-6 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                <CaseSensitive className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest italic text-white/90">Tipografia Independente</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-2xs font-black uppercase tracking-[0.2em] text-white/30 ml-2">Heading Font</label>
                                <SarakSelect 
                                    value={headingFont} 
                                    onChange={(e) => setHeadingFont(e.target.value)}
                                >
                                    <option value="">(Usar Padrão do Tema)</option>
                                    {THEME_FONTS.map((f: any) => <option key={f.id} value={f.value}>{f.name}</option>)}
                                </SarakSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-2xs font-black uppercase tracking-[0.2em] text-white/30 ml-2">Body Font</label>
                                <SarakSelect 
                                    value={bodyFont} 
                                    onChange={(e) => setBodyFont(e.target.value)}
                                >
                                    <option value="">(Usar Padrão do Tema)</option>
                                    {THEME_FONTS.map((f: any) => <option key={f.id} value={f.value}>{f.name}</option>)}
                                </SarakSelect>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ESTILO DE NAVEGAÇÃO */}
                <div className="space-y-6 md:col-span-2 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-white/90">Arquitetura de Navegação</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => setNavigationStyle('sidebar')}
                            className={`flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 ${navigationStyle === 'sidebar' 
                                ? 'bg-emerald-600/20 border-emerald-500/50 shadow-lg' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-4">
                                <SidebarIcon className={`w-8 h-8 ${navigationStyle === 'sidebar' ? 'text-emerald-400' : 'text-white/20'}`} />
                                <div className="text-left">
                                    <div className="text-xs font-black uppercase tracking-widest">Painel Lateral</div>
                                    <div className="text-2xs text-white/40 uppercase">Padrão Sarak OS (Fixo/Expandível)</div>
                                </div>
                            </div>
                            {navigationStyle === 'sidebar' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_var(--theme-success, #10b981)]" />}
                        </button>

                        <button
                            onClick={() => setNavigationStyle('topbar')}
                            className={`flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 ${navigationStyle === 'topbar' 
                                ? 'bg-emerald-600/20 border-emerald-500/50 shadow-lg' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 flex items-center justify-center border-t-2 border-white/20">
                                    <Maximize2 className={`w-5 h-5 ${navigationStyle === 'topbar' ? 'text-emerald-400' : 'text-white/20'}`} />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-black uppercase tracking-widest">Barra Superior</div>
                                    <div className="text-2xs text-white/40 uppercase">Foco no Conteúdo (Minimalista)</div>
                                </div>
                            </div>
                            {navigationStyle === 'topbar' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_var(--theme-success, #10b981)]" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayoutTab;

