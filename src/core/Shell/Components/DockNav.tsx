import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { DiscoveredModule } from '../../../constants/discovery';

interface DockNavProps {
    design: any;
    discoveredModules: DiscoveredModule[];
    activeModuleId: string | null;
    setActiveModuleId: (id: string) => void;
    setIsSearchOpen: (open: boolean) => void;
    isNavVisible: boolean;
    setIsNavVisible: (visible: boolean) => void;
}

export const DockNav: React.FC<DockNavProps> = ({
    design, discoveredModules, activeModuleId, setActiveModuleId, setIsSearchOpen, isNavVisible, setIsNavVisible
}) => {
    const { animationSpeed, isAutoHideEnabled } = design || {};

    return (
        <AnimatePresence>
            {(isNavVisible || !isAutoHideEnabled) && (
                <motion.div 
                    initial={{ y: 100, opacity: 0, scale: 0.9 }} 
                    animate={{ y: 0, opacity: 1, scale: 1 }} 
                    exit={{ y: 100, opacity: 0, scale: 0.9 }} 
                    transition={{ duration: animationSpeed, ease: "circOut" }} 
                    onMouseEnter={() => setIsNavVisible(true)} 
                    onMouseLeave={() => isAutoHideEnabled && setIsNavVisible(false)} 
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 p-2 rounded-[var(--radius-theme)] bg-[var(--theme-card)]/40 backdrop-blur-[var(--glass-blur)] border border-[var(--theme-border)] shadow-[var(--dynamic-shadow)] group/dock"
                >
                    {discoveredModules.filter(m => m.status === 'online').slice(0, 7).map((mod, i) => (
                        <motion.button key={mod.id} whileHover={{ scale: 1.25, y: -12 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => setActiveModuleId(mod.id)} className={`w-12 h-12 rounded-[calc(var(--radius-theme)*0.8)] flex items-center justify-center transition-all ${activeModuleId === mod.id ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]' : 'text-[var(--theme-muted)] hover:text-white hover:bg-white/5'}`}>
                            <IconRenderer name={mod.icon} size={22} />
                        </motion.button>
                    ))}
                    <div className="w-px h-8 bg-[var(--theme-border)] mx-1" />
                    <motion.button whileHover={{ scale: 1.25, y: -12 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => setIsSearchOpen(true)} className="w-12 h-12 rounded-[calc(var(--radius-theme)*0.8)] flex items-center justify-center text-[var(--theme-muted)] hover:text-white hover:bg-white/5"><Search size={22} /></motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
