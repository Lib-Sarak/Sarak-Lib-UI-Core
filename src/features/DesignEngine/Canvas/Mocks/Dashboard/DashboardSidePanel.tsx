import React from 'react';
import { SarakIcon } from '../../../../../components/atomic/Icon/SarakIcon';
import { SmartCard } from './DashboardShared';

export const DashboardSidePanel = ({ variables, textureType }: any) => {
    return (
        <SmartCard variables={variables} textureType={textureType} className="h-[420px] lg:h-full w-full !p-5 @md:!p-6" label="Card de Texto (Logs)">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Activity</h3>
                <SarakIcon name="Clock" size={14} className="text-slate-600" />
            </div>
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                {[
                    { time: '2m ago', type: 'System', msg: 'Security Protocol Updated', color: 'var(--theme-primary)' },
                    { time: '12m ago', type: 'Warning', msg: 'Latency Spike in Node D-1', color: 'var(--theme-warning, var(--theme-primary))' },
                    { time: '45m ago', type: 'AI', msg: 'New Model Injected: GPT-4o', color: 'var(--theme-secondary, var(--theme-primary))' },
                    { time: '1h ago', type: 'Security', msg: 'SSH Breach Attempt Blocked', color: 'var(--theme-error, var(--theme-primary))' },
                    { time: '2h ago', type: 'Ops', msg: 'Sync with Cloud Cluster Complete', color: 'rgb(100, 116, 139)' },
                ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start group">
                        <div className="w-1 h-8 rounded-full opacity-40 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: item.color }} />
                        <div className="flex-1">
                            <div className="flex justify-between mb-0.5">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">{item.type}</span>
                                <span className="text-[9px] font-mono text-slate-600 italic">{item.time}</span>
                            </div>
                            <p className="text-xs text-white/80 leading-snug tracking-tight">{item.msg}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 transition-colors text-[9px] font-bold uppercase tracking-widest text-slate-400 border border-white/5 rounded">
                View All History
            </button>
        </SmartCard>
    );
};
