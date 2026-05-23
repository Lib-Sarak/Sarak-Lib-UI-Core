import React from 'react';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

export const MockTypography: React.FC<any> = ({ tokens }) => {
    return (
        <div className="p-12 space-y-20 max-w-5xl mx-auto">
            <header className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-[var(--theme-primary)]/10 rounded-2xl border border-[var(--theme-primary)]/20">
                        <SarakIcon name="Type" size={20} className="text-[var(--theme-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[var(--theme-title)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            Sistema de Tipografia Soberana
                        </h1>
                        <p className="text-sm text-[var(--theme-muted)] font-bold uppercase tracking-widest mt-1">
                            Validação de Escala e Legibilidade em Tempo Real
                        </p>
                    </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-[var(--theme-border)] to-transparent" />
            </header>

            {/* Display de Escala */}
            <section className="grid grid-cols-1 gap-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-[var(--theme-primary)] tracking-[0.4em] opacity-40">
                        <SarakIcon name="Hash" size={12} />
                        Escala Hierárquica Principal
                    </div>
                    <div className="space-y-8">
                        <h1 style={{ 
                            fontSize: 'var(--sarak-h1-size, 4rem)', 
                            fontWeight: 'var(--sarak-h1-weight, 900)', 
                            fontFamily: 'var(--font-heading)', 
                            lineHeight: 'var(--sarak-h1-lh, 1.1)',
                            letterSpacing: 'var(--sarak-h1-ls, -1px)',
                            textTransform: 'var(--sarak-h-transform, none)'
                        }} className="text-[var(--theme-title)]">
                            The quick brown fox jumps over the lazy dog
                        </h1>
                        <h2 style={{ 
                            fontSize: 'var(--sarak-h2-size, 2.5rem)', 
                            fontWeight: 'var(--sarak-h2-weight, 700)', 
                            fontFamily: 'var(--font-heading)',
                            lineHeight: 'var(--sarak-h2-lh, 1.2)',
                            textTransform: 'var(--sarak-h-transform, none)'
                        }} className="text-[var(--theme-title)]/80">
                            The quick brown fox jumps over the lazy dog
                        </h2>
                        <h3 style={{ 
                            fontSize: 'var(--sarak-h3-size, 1.5rem)', 
                            fontWeight: 'var(--sarak-h2-weight, 600)', 
                            fontFamily: 'var(--font-heading)' 
                        }} className="text-[var(--theme-title)]/60">
                            The quick brown fox jumps over the lazy dog
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-[var(--theme-primary)] tracking-[0.4em] opacity-40">
                            <SarakIcon name="AlignLeft" size={12} />
                            Corpo de Texto (Body Paragraph)
                        </div>
                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                            <p style={{ fontSize: 'var(--theme-font-size-base)', fontFamily: 'var(--font-main)', lineHeight: 1.6 }} className="text-[var(--theme-main)]">
                                A tipografia é o alicerce da interface soberana. Cada glifo deve respirar, mantendo a integridade geométrica mesmo em escalas reduzidas. 
                                Este parágrafo utiliza a configuração de fonte principal do sistema, garantindo que a comunicação técnica seja clara, autoritária e visualmente harmoniosa.
                            </p>
                            <p style={{ fontSize: 'var(--theme-font-size-base)', fontFamily: 'var(--font-main)', lineHeight: 1.6 }} className="text-[var(--theme-main)] opacity-60 italic">
                                "Geometria é o conhecimento da existência aparente, mas a tipografia é o conhecimento da alma da interface."
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-[var(--theme-primary)] tracking-[0.4em] opacity-40">
                            <SarakIcon name="Layers" size={12} />
                            Contextos Auxiliares
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                <span className="text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Navegação de Abas</span>
                                <span style={{ fontFamily: 'var(--font-tab, var(--font-heading))' }} className="text-sm font-bold text-[var(--theme-title)]">Overview System</span>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                <span className="text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Subtítulos & Labels</span>
                                <span style={{ fontFamily: 'var(--font-subtitle, var(--font-heading))' }} className="text-sm font-bold text-[var(--theme-title)]">Security Matrix v2.0</span>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                <span className="text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Tags & Badges</span>
                                <span className="px-3 py-1 rounded-full bg-[var(--theme-primary)] text-white text-[10px] font-black uppercase">Active Engine</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
