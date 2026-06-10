import React from 'react';

export const DashboardHeader = () => {
    return (
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                    <h1 className="text-2xl font-bold tracking-tight uppercase italic text-white">Digital Twin OS</h1>
                </div>
                <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">
                    Operational Intelligence // System Live // Node-04-PR
                </p>
            </div>
            <div className="flex gap-4">
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Uptime</p>
                    <p className="text-sm font-mono text-[var(--theme-primary)]">99.998%</p>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Protocol</p>
                    <p className="text-sm font-mono" style={{ color: 'var(--theme-secondary, var(--theme-primary))' }}>SX-SEC-12</p>
                </div>
            </div>
        </div>
    );
};
