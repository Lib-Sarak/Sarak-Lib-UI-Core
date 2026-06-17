import React from 'react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakInput } from '../../../../components/atomic/Inputs/SarakInput';

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
                        <SarakButton variant="primary">
                            Primary Action
                        </SarakButton>
                        <SarakButton variant="secondary">
                            Secondary Outline
                        </SarakButton>
                        <SarakButton variant="ghost">
                            Ghost Neutral
                        </SarakButton>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Inputs & Toggles</div>
                    <div className="space-y-3">
                        <SarakInput 
                            type="text" 
                            placeholder="Design Engine Input..." 
                            fullWidth
                        />
                        <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-input" style={{ borderRadius: 'var(--sarak-radius)' }}>
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
