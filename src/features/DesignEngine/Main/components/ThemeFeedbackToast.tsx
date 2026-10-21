import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

interface ThemeFeedbackToastProps {
    toast: { message: string; type: 'success' | 'error' | 'warning' } | null;
}

export const ThemeFeedbackToast: React.FC<ThemeFeedbackToastProps> = ({ toast }) => {
    return (
        <AnimatePresence>
            {toast && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100]">
                    <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border shadow-2xl ${toast.type === 'success' ? 'bg-[var(--sarak-status-success-color,#10b981)]/10 border-[var(--sarak-status-success-color,#10b981)]/20 text-[var(--sarak-status-success-color,#10b981)]' : 'bg-[var(--sarak-status-warning-color,#f59e0b)]/10 border-[var(--sarak-status-warning-color,#f59e0b)]/20 text-[var(--sarak-status-warning-color,#f59e0b)]'}`}>
                        {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                        <span className="text-2xs font-black uppercase tracking-widest">{toast.message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
