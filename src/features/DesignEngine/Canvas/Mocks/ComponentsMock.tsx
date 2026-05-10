import React from 'react';

/**
 * MockComponents (v12.7)
 * Demonstração técnica dos 17 pilares de design com suporte total a variáveis granulares.
 */
export const MockComponents: React.FC<any> = ({ tokens }) => {
    return (
        <div className="space-y-8">
            <h3 className="text-sm font-bold text-[var(--theme-title)] mb-6">Component Showcase</h3>
            
            <div className="grid grid-cols-2" style={{ gap: 'var(--theme-gap, 24px)' }}>
                {/* Buttons */}
                <div className="space-y-4">
                    <div className="text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Button States</div>
                    <div className="flex flex-col gap-3">
                        <button className="sarak-preview-btn bg-[var(--sarak-btn-primary-bg,var(--theme-primary))] text-[var(--sarak-btn-primary-text,#fff)] px-4 py-2.5 rounded-btn shadow-theme font-bold text-xs transition-all active:scale-95">
                            Primary Action
                        </button>
                        <button className="sarak-preview-btn border border-[var(--sarak-btn-primary-bg,var(--theme-primary))] text-[var(--sarak-btn-primary-bg,var(--theme-primary))] px-4 py-2.5 rounded-btn font-bold text-xs">
                            Secondary Outline
                        </button>
                        <button className="sarak-preview-btn text-[var(--theme-title)] px-4 py-2.5 rounded-btn bg-[var(--sarak-btn-ghost-hover,rgba(255,255,255,0.05))] font-bold text-xs">
                            Ghost Neutral
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Inputs & Toggles</div>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Design Engine Input..." 
                            className="w-full bg-[var(--sarak-input-bg,var(--theme-card))] border border-[var(--theme-border)] rounded-input px-4 py-2.5 text-xs text-[var(--theme-title)] outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20" 
                        />
                        <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-input">
                            <span className="text-2xs text-[var(--theme-title)] font-medium">Dynamic Switch</span>
                            <div className="w-10 h-5 bg-[var(--sarak-switch-active-bg,var(--theme-primary))] rounded-full relative shadow-inner">
                                <div className="absolute top-1 right-1 w-3 h-3 bg-[var(--sarak-switch-thumb,#fff)] rounded-full shadow-md"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges & Feedback */}
            <div className="space-y-4">
                <div className="text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Badges & Indicators</div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-[var(--sarak-status-success,var(--theme-success))]/10 text-[var(--sarak-status-success,var(--theme-success))] border border-[var(--sarak-status-success,var(--theme-success))]/20 text-[10px] font-black uppercase tracking-tighter">Success</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--sarak-status-error,var(--theme-error))]/10 text-[var(--sarak-status-error,var(--theme-error))] border border-[var(--sarak-status-error,var(--theme-error))]/20 text-[10px] font-black uppercase tracking-tighter">Alert</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 text-[10px] font-black uppercase tracking-tighter">Processing</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/10 text-[10px] font-black uppercase tracking-tighter">Offline</span>
                </div>
            </div>
        </div>
    );
};
