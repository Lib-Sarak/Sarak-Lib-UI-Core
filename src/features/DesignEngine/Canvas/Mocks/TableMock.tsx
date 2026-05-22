import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Plus, ArrowUpDown, Search, FileSpreadsheet, Activity, Users, ArrowRight } from 'lucide-react';

export const MockTable: React.FC<any> = ({ tokens, animationVariants }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const excelRows = [
        { id: 'TRX-901', date: '12/04/2026', desc: 'AWS Hosting', amount: '-$1,240.00', status: 'Cleared' },
        { id: 'TRX-902', date: '13/04/2026', desc: 'Stripe Payout', amount: '+$8,450.00', status: 'Processing' },
        { id: 'TRX-903', date: '14/04/2026', desc: 'Github Copilot', amount: '-$190.00', status: 'Cleared' },
        { id: 'TRX-904', date: '15/04/2026', desc: 'Vercel Pro', amount: '-$40.00', status: 'Cleared' },
        { id: 'TRX-905', date: '16/04/2026', desc: 'Client Retainer', amount: '+$5,000.00', status: 'Pending' },
        { id: 'TRX-906', date: '17/04/2026', desc: 'Google Cloud', amount: '-$840.00', status: 'Cleared' },
    ];

    const interactiveRows = [
        { id: 'SRK-091', name: 'Scraper_V2_Core', version: 'v3.2', status: 'Online', load: '14%' },
        { id: 'SRK-092', name: 'Parser_Engine_JS', version: 'v2.0', status: 'Idle', load: '0%' },
        { id: 'SRK-093', name: 'Auth_Identity_DB', version: 'v5.1', status: 'Online', load: '45%' },
        { id: 'SRK-094', name: 'Webhook_API', version: 'v2.1', status: 'Warning', load: '92%' }
    ];

    return (
        <motion.div variants={animationVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar p-2">
            
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Tabela Interativa (Atual Administrativa) */}
                <div className="flex-[2] sarak-card rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="text-[var(--theme-primary)]" size={16} />
                            <h3 className="font-bold text-sm text-[var(--theme-title)] uppercase tracking-widest">Painel Operacional</h3>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-sec)]" size={12} />
                            <input type="text" placeholder="Buscar..." className="bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[var(--theme-primary)]" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--sarak-table-border)] text-[var(--theme-text-sec)]" style={{ backgroundColor: 'var(--sarak-table-header-bg)', fontFamily: 'var(--font-tab, var(--font-heading))' }}>
                                    {['CÓDIGO', 'MÓDULO', 'VERSÃO', 'STATUS', 'CARGA'].map(h => (
                                        <th key={h} className="font-bold uppercase tracking-wider px-4 py-3 border-r border-[var(--sarak-table-border)] last:border-r-0">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--sarak-table-border)]">
                                {interactiveRows.map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3 font-bold text-[var(--theme-title)] border-r border-[var(--sarak-table-border)]">{row.id}</td>
                                        <td className="px-4 py-3 font-medium text-[var(--theme-title)] border-r border-[var(--sarak-table-border)]">{row.name}</td>
                                        <td className="px-4 py-3 text-[var(--theme-text-sec)] border-r border-[var(--sarak-table-border)]">{row.version}</td>
                                        <td className="px-4 py-3 border-r border-[var(--sarak-table-border)]">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border flex w-max items-center gap-1.5 ${
                                                row.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                row.status === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Online' ? 'bg-emerald-500 animate-pulse' : row.status === 'Warning' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border-r border-[var(--sarak-table-border)] last:border-r-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold w-6">{row.load}</span>
                                                <div className="flex-1 h-1.5 bg-[var(--theme-border)] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[var(--theme-primary)]" style={{ width: row.load }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mini Tabela em Card */}
                <div className="flex-1 sarak-card rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[var(--theme-title)]">
                            <Users size={16} className="text-[var(--theme-primary)]" />
                            <h3 className="font-bold text-sm uppercase tracking-widest">Top Usuários</h3>
                        </div>
                        <button className="text-[10px] font-bold text-[var(--theme-primary)] flex items-center gap-1 hover:underline">VER TODOS <ArrowRight size={10} /></button>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--theme-body)] transition-colors border border-transparent hover:border-[var(--theme-border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center font-bold text-xs text-[var(--theme-primary)]">U{i}</div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-[var(--theme-title)] truncate max-w-[120px]">User_Alpha_{i}9</span>
                                        <span className="text-[10px] text-[var(--theme-text-sec)]">admin@sarak.io</span>
                                    </div>
                                </div>
                                <div className="text-xs font-mono font-bold text-[var(--theme-title)]">{Math.floor(Math.random() * 1000)} pts</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabela Densa (Excel) */}
            <div className="w-full sarak-card rounded-2xl border border-[var(--sarak-table-border)] bg-[var(--theme-body)] shadow-xl overflow-hidden flex flex-col">
                <div className="p-3 border-b border-[var(--sarak-table-border)] flex items-center justify-between bg-[var(--sarak-table-header-bg)]">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="text-emerald-500" size={14} />
                        <h3 className="font-bold text-xs text-[var(--theme-title)] font-mono uppercase">Financial_Ledger_Q2.xlsx</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-2 py-1 bg-white/5 hover:bg-white/10 transition-colors text-[9px] font-bold uppercase tracking-widest border border-white/5 rounded flex items-center gap-1 text-[var(--theme-title)]">
                            <Download size={10} /> CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {/* Aqui forçamos a tabela a não ter padding vertical (densidade extrema) e usar monoespaço */}
                    <table className="w-full text-left text-[10px] font-mono border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--sarak-table-border)] text-[var(--theme-text-sec)] bg-[var(--sarak-table-header-bg)]">
                                {['Transaction ID', 'Date', 'Description', 'Amount', 'Status'].map(h => (
                                    <th key={h} className="font-bold uppercase px-3 py-1.5 border-r border-[var(--sarak-table-border)] last:border-r-0">
                                        <div className="flex items-center gap-1">{h} <ArrowUpDown size={8} className="opacity-50" /></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--sarak-table-border)]">
                            {excelRows.map((row, i) => (
                                <tr key={i} className="hover:bg-[var(--sarak-table-row-hover)] transition-colors">
                                    <td className="px-3 py-1 font-bold text-[var(--theme-title)] border-r border-[var(--sarak-table-border)] opacity-80">{row.id}</td>
                                    <td className="px-3 py-1 text-[var(--theme-text-sec)] border-r border-[var(--sarak-table-border)]">{row.date}</td>
                                    <td className="px-3 py-1 text-[var(--theme-title)] border-r border-[var(--sarak-table-border)] truncate max-w-[200px]">{row.desc}</td>
                                    <td className={`px-3 py-1 border-r border-[var(--sarak-table-border)] font-bold text-right ${row.amount.includes('+') ? 'text-emerald-500' : 'text-[var(--theme-title)]'}`}>
                                        {row.amount}
                                    </td>
                                    <td className="px-3 py-1 border-r border-[var(--sarak-table-border)] last:border-r-0 text-[var(--theme-text-sec)] italic">
                                        {row.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-2 border-t border-[var(--sarak-table-border)] bg-[var(--sarak-table-header-bg)] text-[9px] font-mono text-[var(--theme-text-sec)] flex justify-between">
                    <span>6 ROWS LOADED</span>
                    <span>SUM: +$11,940.00</span>
                </div>
            </div>

        </motion.div>
    );
};
