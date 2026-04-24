import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Box, Compass } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

interface SarakEmptyStateProps {
    type?: 'minimal' | 'abstract' | 'geometric';
}

export const SarakEmptyState: React.FC<SarakEmptyStateProps> = ({ type = 'abstract' }) => {
    const { design } = useSarakUI();
    const { primaryColor, systemName } = design || {};

    const containerVariants = {
        initial: { opacity: 0 },
        animate: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
    };

    if (type === 'minimal') {
        return (
            <motion.div 
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="flex flex-col items-center justify-center h-full opacity-20 grayscale"
            >
                <motion.div variants={itemVariants} className="mb-6 pointer-events-none">
                    <Compass size={64} strokeWidth={1} />
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-xl font-bold uppercase tracking-[0.5em]">{systemName || 'Sarak Lib'}</motion.h2>
                <motion.p variants={itemVariants} className="text-2xs mt-2 uppercase tracking-widest italic">Waiting for System Interaction...</motion.p>
            </motion.div>
        );
    }

    if (type === 'geometric') {
        return (
            <motion.div 
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
            >
                <div className="absolute inset-0 opacity-[0.03]" 
                    style={{ 
                        backgroundImage: `radial-gradient(circle at 2px 2px, ${primaryColor} 1px, transparent 0)`,
                        backgroundSize: '40px 40px' 
                    }} 
                />
                
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="w-[500px] h-[500px] border border-dashed border-white/5 rounded-full flex items-center justify-center relative"
                >
                    <div className="w-[300px] h-[300px] border border-dashed border-white/10 rounded-full" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--theme-primary)] shadow-[0_0_15px_var(--theme-primary)]" />
                </motion.div>

                <div className="absolute z-10 text-center">
                    <motion.div variants={itemVariants} className="text-[var(--theme-primary)] mb-6 mx-auto w-12 h-12 flex items-center justify-center">
                        <Box size={40} strokeWidth={1} />
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-2xl font-black uppercase tracking-[0.8em] text-white/10 ml-[0.8em]">VOID</motion.h2>
                    <motion.p variants={itemVariants} className="text-2xs mt-4 uppercase tracking-[0.2em] text-[var(--theme-primary)]/40 font-bold">Start a module in the toolbar</motion.p>
                </div>
            </motion.div>
        );
    }

    // Default: Abstract
    return (
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex flex-col items-center justify-center h-full relative"
        >
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute w-[300px] h-[300px] rounded-full bg-[var(--theme-primary)]/5 blur-[100px]"
            />
            
            <motion.div variants={itemVariants} className="relative mb-8">
                <div className="relative z-10 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl">
                    <Sparkles size={48} className="text-[var(--theme-primary)] animate-pulse" />
                </div>
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border border-white/5 rounded-[2rem] border-dashed"
                />
            </motion.div>

            <motion.div variants={itemVariants} className="text-center z-10">
                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 mb-2">Sarak Lib Core Engine</h2>
                <div className="h-px w-12 bg-[var(--theme-primary)]/40 mx-auto mb-4" />
                <p className="text-2xs text-white/20 uppercase tracking-widest max-w-[280px] leading-loose">
                    The ecosystem is in harmony. <br/>
                    No signal detected in the main viewport.
                </p>
            </motion.div>
        </motion.div>
    );
};

