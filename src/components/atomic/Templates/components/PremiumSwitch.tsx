import React from 'react';
import { motion } from 'framer-motion';

export const PremiumSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer flex items-center ${
            checked ? 'bg-[var(--sx-color-primary-base)] shadow-[0_0_10px_rgba(var(--sx-color-primary-base),0.3)]' : 'bg-[var(--sx-color-text-muted)]/10'
        }`}
    >
        <motion.div 
            layout
            className="w-4 h-4 rounded-full bg-white shadow-md"
            animate={{ x: checked ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
    </div>
);
