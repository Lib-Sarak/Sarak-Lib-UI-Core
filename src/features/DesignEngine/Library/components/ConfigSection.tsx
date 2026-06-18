import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, LucideIcon } from 'lucide-react';

interface ConfigSectionProps {
    id: string;
    icon: LucideIcon;
    title: string;
    isOpen: boolean;
    onToggle: (id: string) => void;
    children: React.ReactNode;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({ id, icon: Icon, title, isOpen, onToggle, children }) => {
    return (
        <div className="border-b border-[var(--theme-border)]/50 flex flex-col last:border-0">
            <button
                onClick={() => onToggle(id)}
                className={`flex items-center justify-between p-4 transition-all group ${isOpen ? 'bg-[var(--theme-primary)]/5' : 'hover:bg-[var(--theme-primary)]/5'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--theme-card)] text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)] border border-[var(--theme-border)]'}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-2xs font-black uppercase tracking-widest ${isOpen ? 'text-[var(--theme-title)]' : 'text-[var(--theme-muted)] group-hover:text-[var(--theme-title)]'}`}>
                        {title}
                    </span>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[var(--theme-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--theme-muted)]" />}
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-2 space-y-6">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
