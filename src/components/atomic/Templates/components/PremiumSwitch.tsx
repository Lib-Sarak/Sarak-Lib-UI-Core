import React from 'react';
import { motion } from 'framer-motion';

export const PremiumSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`w-9 h-5 rounded-full transition-all cursor-pointer flex items-center ${
            checked ? 'bg-[var(--sarak-primary-color,#3b82f6)] shadow-[0_0_10px_rgba(var(--sarak-primary-color,#3b82f6),0.3)]' : 'bg-[var(--text-muted,#94a3b8)]/10'
        }`}
        style={{ padding: 'calc(calc(var(--sarak-layout-gap-md,16px)*0.25) / 2)' }}
    >
        <motion.div 
            layout
            className="w-4 h-4 rounded-full bg-white shadow-md"
            animate={{ x: checked ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
    </div>
);
