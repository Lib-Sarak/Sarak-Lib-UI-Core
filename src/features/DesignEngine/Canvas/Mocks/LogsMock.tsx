import React from 'react';
import { motion } from 'framer-motion';

export const MockLogs: React.FC<any> = ({ animationVariants, animationStyle, tokens }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-sm font-bold text-[var(--theme-title)]">Execution History</h3>
            </div>
            <motion.div
                initial={animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial}
                animate={animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate}
                transition={{ ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), duration: parseFloat(tokens.animationSpeed || '0.4') }}
                className="bg-theme-card shadow-[var(--theme-shadow)] overflow-hidden relative"
                style={{ 
                    borderRadius: 'var(--radius-theme)',
                    borderWidth: 'var(--theme-border-width)',
                    borderStyle: 'var(--theme-border-style)',
                    borderColor: 'var(--theme-border)'
                }}
            >
                <div className="absolute inset-0 bg-white/[0.02] pointer-events-none"></div>
                <table className="w-full text-left text-2xs relative z-10">
                    <thead className="bg-[var(--theme-card)] border-b border-[var(--theme-border)]">
                        <tr style={{ fontFamily: 'var(--font-tab, var(--font-heading))' }}>
                            <th className="p-3 font-bold text-[var(--theme-muted)] uppercase tracking-wider">Payload</th>
                            <th className="p-3 font-bold text-[var(--theme-muted)] uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--theme-border)]/30">
                        {[
                            { name: "Scraper_V2", status: "Completed", color: "text-emerald-500" },
                            { name: "Parser_Engine", status: "Failed", color: "text-rose-500" }
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-[var(--theme-primary)]/5 transition-colors">
                                <td className="p-3 font-medium text-[var(--theme-title)]">{row.name}</td>
                                <td className={`p-3 font-bold ${row.color}`}>{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

