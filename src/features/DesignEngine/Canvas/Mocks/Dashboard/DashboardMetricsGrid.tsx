import React from 'react';
import { SarakTitleCard } from '../../../../../components/atomic/Cards/SarakTitleCard';
import { SarakSearchCard } from '../../../../../components/atomic/Cards/SarakSearchCard';
import { SarakActionCard } from '../../../../../components/atomic/Cards/SarakActionCard';
import { SarakIcon } from '../../../../../components/atomic/Icon/SarakIcon';
import { SmartCard } from './DashboardShared';

export const DashboardMetricsGrid = ({ tokens, variables, textureType, items, mappings }: any) => {
    return (
        <div className="grid grid-cols-1 @md:grid-cols-12 gap-6 auto-rows-auto">
            {/* ROW 1 */}
            <SarakTitleCard item={items.cpu} mapping={mappings.cpu} design={tokens} className="@md:col-span-3" label="Card de Título (CPU Cluster)" />
            <SarakSearchCard item={items.search} mapping={mappings.search} design={tokens} className="@md:col-span-3" label="Card de Interação (Busca)" />
            
            <SmartCard variables={variables} textureType={textureType} className="@md:col-span-3 p-5 @md:p-6 !gap-4" label="Card de Métricas (Latency)">
                <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[11px] uppercase font-bold tracking-wider">Latency</span>
                    <SarakIcon name="Activity" size={14} />
                </div>
                <div className="flex items-end gap-3">
                    <span className="text-3xl font-mono text-white">14ms</span>
                    <span className="text-[10px] text-[var(--theme-primary)] mb-1 font-bold">Stable</span>
                </div>
                <div className="flex gap-1 h-6 items-end">
                    {[30, 45, 20, 60, 40, 25, 35, 50, 45, 30, 20, 40].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/10 rounded-t-[1px]" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </SmartCard>

            <SarakTitleCard item={items.health} mapping={mappings.health} design={tokens} className="@md:col-span-3" label="Card de Título (Health)" />

            {/* ROW 2 */}
            <SmartCard variables={variables} textureType={textureType} className="@md:col-span-12 h-[420px] p-5 @md:p-6 @lg:p-8" label="Card de Gráficos (Data Flow)">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Data Flow Engine</h3>
                        <p className="text-[10px] text-slate-600 font-mono">PACKET PROCESSING REAL-TIME</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[var(--theme-primary-bg)] text-[var(--theme-primary)] text-[9px] font-bold border border-[var(--theme-primary-border)] uppercase tracking-tighter">Channel-08-X</span>
                    </div>
                </div>
                <div className="flex-1 flex items-end gap-3 pb-4">
                    {[40, 60, 35, 55, 45, 75, 40, 85, 95, 65, 50, 70].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-[var(--theme-primary)]/20 to-[var(--theme-primary)]/80 rounded-t-lg transition-all hover:scale-110 cursor-pointer group relative" style={{ height: `${height}%` }}>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[8px] font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {height}%
                            </div>
                        </div>
                    ))}
                </div>
            </SmartCard>

            {/* ROW 3 */}
            <SmartCard variables={variables} textureType={textureType} className="@md:col-span-4 p-5 @md:p-6 @lg:p-8" label="Card de Ação (Inventory)">
                <div className="flex items-center gap-4 mb-4">
                    <SarakIcon name="Package" size={20} className="text-[var(--theme-primary)]" />
                    <h3 className="text-sm font-bold text-white uppercase italic tracking-wider">Inventory Flow</h3>
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                            <span className="text-slate-400 uppercase">Primary Stock</span>
                            <span className="text-[var(--theme-primary)]">85% - SAFE</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--theme-primary)]/40 w-[85%]" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                            <span className="text-slate-400 uppercase">Critical Parts</span>
                            <span style={{ color: 'var(--theme-error, var(--theme-primary))' }}>12% - ALERT</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[12%]" style={{ backgroundColor: 'rgba(var(--theme-error-rgb, 239, 68, 68), 0.4)' }} />
                        </div>
                    </div>
                    <div className="pt-2 grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">In Transit</p>
                            <p className="text-xl font-mono text-white tracking-tighter">24</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pending</p>
                            <p className="text-xl font-mono text-white tracking-tighter">08</p>
                        </div>
                    </div>
                </div>
            </SmartCard>

            <SmartCard variables={variables} textureType={textureType} className="@md:col-span-5 !p-0" label="Card de Tabela (Access)">
                <div className="p-5 pb-3 @md:p-8 @md:pb-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <SarakIcon name="Shield" size={20} className="text-[var(--theme-primary)]" />
                        <h3 className="text-sm font-bold text-white uppercase italic tracking-wider">Access Control</h3>
                    </div>
                    <SarakIcon name="Search" size={16} className="text-slate-600" />
                </div>
                <div className="px-5 pb-5 @md:px-8 @md:pb-8">
                    <table className="w-full text-[11px] font-mono text-slate-400">
                        <thead>
                            <tr className="text-left border-b border-white/5">
                                <th className="pb-3 font-bold uppercase tracking-wider">Identity</th>
                                <th className="pb-3 font-bold uppercase tracking-wider">Sector</th>
                                <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { user: 'Igor Sarak', sector: 'R&D Lab', status: 'Authorized', color: 'var(--theme-primary)' },
                                { user: 'Alpha Node', sector: 'Server Room', status: 'Active', color: 'var(--theme-secondary, var(--theme-primary))' },
                                { user: 'Unknown', sector: 'Main Gate', status: 'Warning', color: 'var(--theme-warning, var(--theme-primary))' },
                                { user: 'Support-01', sector: 'Office', status: 'Authorized', color: 'var(--theme-primary)' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 text-white/90 font-medium">{row.user}</td>
                                    <td className="py-4 uppercase italic text-[10px]">{row.sector}</td>
                                    <td className="py-4 font-bold" style={{ color: row.color }}>{row.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SmartCard>

            <SarakActionCard item={items.anomaly} mapping={mappings.anomaly} design={tokens} className="@md:col-span-3 h-full" onAction={() => alert("Acknowledge Action Executed!")} label="Card de Interação (Radar)" />
            
            {/* ROW 4 */}
            <SmartCard variables={variables} textureType={textureType} className="@md:col-span-3 p-5 @md:p-6 @lg:p-8" label="Card de Métricas (Ambiente)">
                <div className="flex justify-between mb-6">
                    <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Environment</span>
                    <SarakIcon name="Thermometer" size={16} style={{ color: 'var(--theme-error, var(--theme-primary))' }} />
                </div>
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-3xl font-mono text-white italic tracking-tighter">24.2°C</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ambient Temp</p>
                        </div>
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[60%]" style={{ backgroundColor: 'rgba(var(--theme-error-rgb, 239, 68, 68), 0.5)' }} />
                        </div>
                    </div>
                </div>
            </SmartCard>
            
            <SmartCard variables={variables} textureType={textureType} className="@md:col-span-4 p-5 @md:p-6 @lg:p-8" label="Card de Métricas (Energia)">
                <div className="flex justify-between mb-6">
                    <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Energy Grid</span>
                    <SarakIcon name="Zap" size={16} style={{ color: 'var(--theme-warning, var(--theme-primary))' }} />
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex-1 space-y-5">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
                                <span>Consumption</span>
                                <span className="text-white font-mono">1.2kW</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[65%]" style={{ backgroundColor: 'rgba(var(--theme-warning-rgb, 245, 158, 11), 0.4)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </SmartCard>

            <SmartCard variables={variables} textureType={textureType} className="@md:col-span-5 p-5 @md:p-6 @lg:p-8 overflow-visible" label="Card de Interação (Terminal)">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Operational Commands</h3>
                    <SarakIcon name="Terminal" size={16} className="text-[var(--theme-primary)]" />
                </div>
                <div className="flex flex-col @xl:flex-row gap-4">
                    <div className="flex-1 bg-black/40 border border-white/5 p-5 rounded-lg font-mono text-[11px] text-[var(--theme-primary)]/80 relative group min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                            <span className="text-white/70 font-bold uppercase tracking-tighter">NODE_PROMPT_WAITING...</span>
                        </div>
                        <p className="text-white/40 mb-1">&gt; fetch_sync_data --target=alpha</p>
                    </div>
                </div>
            </SmartCard>
        </div>
    );
};
