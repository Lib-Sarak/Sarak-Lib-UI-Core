import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';
import { SarakInput } from '../../../../components/atomic/Inputs/SarakInput';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakBadge, type SarakBadgeVariant } from '../../../../components/atomic/Feedback/SarakBadge';
import { SarakDataTable, type SarakColumn } from '../../../../components/atomic/DataDisplay/SarakDataTable';

interface OperationalRow { id: string; name: string; version: string; status: string; load: string }
interface LedgerRow { id: string; date: string; desc: string; amount: string; status: string }

const OPERATIONAL_HEIGHT = 208;
const LEDGER_ROW_HEIGHT = 28;
const LEDGER_HEIGHT = LEDGER_ROW_HEIGHT * 7;
const STATUS_VARIANT: Readonly<Record<string, SarakBadgeVariant>> = { Online: 'success', Warning: 'warning' };

/** As colunas do painel operacional: a tabela real da lib, que lê densidade, listras e cantos do design (o componente preguiçoso perde o tipo da linha). */
const OPERATIONAL_COLUMNS: Array<SarakColumn<unknown>> = [
    { id: 'id', header: 'CÓDIGO', width: 100 },
    { id: 'name', header: 'MÓDULO', width: 170 },
    { id: 'version', header: 'VERSÃO', width: 90 },
    { id: 'status', header: 'STATUS', width: 120, render: (row) => { const { status } = row as OperationalRow; return <SarakBadge variant={STATUS_VARIANT[status] ?? 'muted'} soft pill>{status}</SarakBadge>; } },
    { id: 'load', header: 'CARGA', width: 90 },
];

const LEDGER_COLUMNS: Array<SarakColumn<unknown>> = [
    { id: 'id', header: 'Transaction ID', width: 130 },
    { id: 'date', header: 'Date', width: 110 },
    { id: 'desc', header: 'Description', width: 200 },
    { id: 'amount', header: 'Amount', width: 120, align: 'right' },
    { id: 'status', header: 'Status', width: 110 },
];

export const MockTable: React.FC<any> = ({ tokens, animationVariants }) => {
    const excelRows: LedgerRow[] = [
        { id: 'TRX-901', date: '12/04/2026', desc: 'AWS Hosting', amount: '-$1,240.00', status: 'Cleared' },
        { id: 'TRX-902', date: '13/04/2026', desc: 'Stripe Payout', amount: '+$8,450.00', status: 'Processing' },
        { id: 'TRX-903', date: '14/04/2026', desc: 'Github Copilot', amount: '-$190.00', status: 'Cleared' },
        { id: 'TRX-904', date: '15/04/2026', desc: 'Vercel Pro', amount: '-$40.00', status: 'Cleared' },
        { id: 'TRX-905', date: '16/04/2026', desc: 'Client Retainer', amount: '+$5,000.00', status: 'Pending' },
        { id: 'TRX-906', date: '17/04/2026', desc: 'Google Cloud', amount: '-$840.00', status: 'Cleared' },
    ];

    const interactiveRows: OperationalRow[] = [
        { id: 'SRK-091', name: 'Scraper_V2_Core', version: 'v3.2', status: 'Online', load: '14%' },
        { id: 'SRK-092', name: 'Parser_Engine_JS', version: 'v2.0', status: 'Idle', load: '0%' },
        { id: 'SRK-093', name: 'Auth_Identity_DB', version: 'v5.1', status: 'Online', load: '45%' },
        { id: 'SRK-094', name: 'Webhook_API', version: 'v2.1', status: 'Warning', load: '92%' }
    ];

    return (
        <motion.div variants={animationVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar p-2">
            
            <div className="flex flex-col @xl:flex-row gap-6">
                {/* Tabela Interativa (Atual Administrativa) */}
                <div className="flex-[2] sarak-card rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SarakIcon name="Activity" className="text-[var(--theme-primary)]" size={16} />
                            <h3 className="font-bold text-sm text-[var(--theme-title)] uppercase tracking-widest">Painel Operacional</h3>
                        </div>
                        <div className="w-48">
                            <SarakInput 
                                type="text" 
                                placeholder="Buscar..." 
                                fullWidth
                                leftIcon={<SarakIcon name="Search" className="text-[var(--text-secondary)]" size={12} />} 
                            />
                        </div>
                    </div>
                    <React.Suspense fallback={<div style={{ height: OPERATIONAL_HEIGHT }} aria-hidden="true" />}>
                        <SarakDataTable columns={OPERATIONAL_COLUMNS} rows={interactiveRows} height={OPERATIONAL_HEIGHT} responsive={false} reorderable={false} getRowKey={(row) => (row as { id: string }).id} />
                    </React.Suspense>
                </div>

                {/* Mini Tabela em Card */}
                <div className="flex-1 sarak-card rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[var(--theme-title)]">
                            <SarakIcon name="Users" size={16} className="text-[var(--theme-primary)]" />
                            <h3 className="font-bold text-sm uppercase tracking-widest">Top Usuários</h3>
                        </div>
                        <SarakButton variant="ghost" size="xs" rightIcon={<SarakIcon name="ArrowRight" size={10} />}>
                            VER TODOS
                        </SarakButton>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--theme-body)] transition-colors border border-transparent hover:border-[var(--theme-border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center font-bold text-xs text-[var(--theme-primary)]">U{i}</div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-[var(--theme-title)] truncate max-w-[120px]">User_Alpha_{i}9</span>
                                        <span className="text-[10px] text-[var(--text-secondary)]">admin@sarak.io</span>
                                    </div>
                                </div>
                                <div className="text-xs font-mono font-bold text-[var(--theme-title)]">{i * 137 + 44} pts</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabela Densa (Excel) */}
            <div className="w-full sarak-card rounded-2xl border border-[var(--sarak-table-border)] bg-[var(--theme-body)] overflow-hidden flex flex-col">
                <div className="p-3 border-b border-[var(--sarak-table-border)] flex items-center justify-between bg-[var(--sarak-table-header-bg)]">
                    <div className="flex items-center gap-2">
                        <SarakIcon name="FileSpreadsheet" className="text-[var(--sarak-status-success-color,#10b981)]" size={14} />
                        <h3 className="font-bold text-xs text-[var(--theme-title)] font-mono uppercase">Financial_Ledger_Q2.xlsx</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <SarakButton variant="secondary" size="xs" leftIcon={<SarakIcon name="Download" size={10} />}>
                            CSV
                        </SarakButton>
                    </div>
                </div>
                <React.Suspense fallback={<div style={{ height: LEDGER_HEIGHT }} aria-hidden="true" />}>
                    <SarakDataTable columns={LEDGER_COLUMNS} rows={excelRows} height={LEDGER_HEIGHT} rowHeight={LEDGER_ROW_HEIGHT} headerHeight={LEDGER_ROW_HEIGHT} responsive={false} reorderable={false} getRowKey={(row) => (row as { id: string }).id} />
                </React.Suspense>
                <div className="p-2 border-t border-[var(--sarak-table-border)] bg-[var(--sarak-table-header-bg)] text-[9px] font-mono text-[var(--text-secondary)] flex justify-between">
                    <span>6 ROWS LOADED</span>
                    <span>SUM: +$11,940.00</span>
                </div>
            </div>

        </motion.div>
    );
};
