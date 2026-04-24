import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface GalleryItemProps {
    title: string;
    description?: string;
    isActive?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({ title, description, isActive, onClick, children }) => {
    return (
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`group relative flex flex-col bg-white/[0.02] border rounded-2xl p-4 transition-all cursor-pointer ${isActive ? 'border-[var(--theme-primary)] shadow-[0_0_30px_rgba(var(--theme-primary-rgb),0.2)]' : 'border-white/5 hover:border-white/10'}`}
        >
            <div className="flex-1 flex items-center justify-center min-h-[160px] mb-4 bg-transparent rounded-xl overflow-hidden relative">
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {children}
                </div>
                
                {isActive && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                        <Check size={12} className="text-white" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[var(--theme-primary)]' : 'text-white/60'}`}>
                    {title}
                </span>
                {description && (
                    <span className="text-[9px] text-white/30 uppercase tracking-wider font-medium">
                        {description}
                    </span>
                )}
            </div>
        </motion.div>
    );
};
