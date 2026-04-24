import React from 'react';

export const MockComponents: React.FC<any> = ({ tokens }) => {
    return (
        <div className="space-y-8">
            <h3 className="text-sm font-bold text-[var(--theme-title)] mb-6">Component Showcase</h3>
            
            <div className="grid grid-cols-2 gap-6">
                {/* Buttons */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Button States</div>
                    <div className="flex flex-col gap-3">
                        <button className="bg-[var(--theme-primary)] text-white px-4 py-2 rounded-theme shadow-theme font-bold text-[11px]">Primary Action</button>
                        <button className="border border-[var(--theme-primary)] text-[var(--theme-primary)] px-4 py-2 rounded-theme font-bold text-[11px]">Secondary Outline</button>
                        <button className="text-[var(--theme-title)] px-4 py-2 rounded-theme bg-white/5 font-bold text-[11px]">Ghost Neutral</button>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Inputs & Toggles</div>
                    <div className="space-y-3">
                        <input type="text" placeholder="Design Engine Input..." className="w-full bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-theme px-3 py-2 text-[11px] text-[var(--theme-title)]" />
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-theme">
                            <span className="text-[10px] text-[var(--theme-title)]">Dynamic Switch</span>
                            <div className="w-8 h-4 bg-[var(--theme-primary)] rounded-full relative">
                                <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges & Feedback */}
            <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Badges & Indicators</div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold">Success</span>
                    <span className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-bold">Alert</span>
                    <span className="px-2 py-1 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 text-[9px] font-bold">Processing</span>
                    <span className="px-2 py-1 rounded-full bg-white/5 text-white/40 border border-white/10 text-[9px] font-bold">Offline</span>
                </div>
            </div>
        </div>
    );
};
