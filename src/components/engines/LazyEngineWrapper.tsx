import React, { Suspense, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSarakUI } from '../../core/Provider/SarakUIProvider';

interface LazyEngineWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Universal Wrapper for Sarak Prime v7.0 Engines.
 * Handles graceful loading states with premium aesthetics.
 */
export const LazyEngineWrapper: React.FC<LazyEngineWrapperProps> = ({ children, fallback }) => {
    const { design } = useSarakUI();
    const { primaryColor } = design || {};

    const DefaultFallback = (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-[var(--theme-card)]/20 rounded-[var(--radius-theme)] border border-white/5 relative overflow-hidden">
            <motion.div 
                animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.98, 1, 0.98]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center"
            >
                <div className="w-12 h-12 rounded-full border-2 border-t-[var(--theme-primary)] border-white/5 animate-spin mb-4" />
                <span className="text-2xs font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">Initializing Engine...</span>
            </motion.div>
            
            {/* Background Glow */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{ 
                    background: `radial-gradient(circle at center, ${primaryColor} 0%, transparent 70%)` 
                }} 
            />
        </div>
    );

    return (
        <Suspense fallback={fallback || DefaultFallback}>
            {children}
        </Suspense>
    );
};

export default LazyEngineWrapper;

