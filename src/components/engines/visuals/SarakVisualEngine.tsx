import React from 'react';
import { motion } from 'framer-motion';

interface SarakVisualEngineProps {
    type: 'globe' | 'mesh' | 'topology' | 'map-density' | 'point-cloud' | 'hologram' | 'motor-twin' | 'factory-floor' | 'pump-system';
    tokens: any;
}

const SarakVisualEngine: React.FC<SarakVisualEngineProps> = ({ type, tokens }) => {
    const primaryColor = tokens.primaryColor || '#3b82f6';

    const renderVisual = () => {
        switch (type) {
            case 'motor-twin':
                return (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <motion.div 
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="relative w-48 h-32"
                            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl" style={{ transform: 'translateZ(20px)' }}>
                                <div className="absolute inset-0 flex flex-col justify-between p-2">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="h-[1px] w-full bg-white/10" />
                                    ))}
                                </div>
                            </div>
                            <div className="absolute -top-4 left-1/4 w-16 h-8 bg-white/10 border border-white/20 rounded-md" style={{ transform: 'translateZ(40px)' }} />
                            <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-16 h-6 bg-gradient-to-b from-white/20 to-white/5 border border-white/20 rounded-sm" />
                            <motion.div 
                                animate={{ opacity: [0.2, 0.8, 0.2] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute top-1/4 left-1/3 w-6 h-6 bg-red-500/40 blur-lg rounded-full"
                            />
                        </motion.div>
                    </div>
                );

            case 'factory-floor':
                return (
                    <div className="relative w-full h-full p-2 overflow-hidden bg-black/40">
                        <div 
                            className="absolute inset-0 opacity-10" 
                            style={{ 
                                backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
                                backgroundSize: '15px 15px',
                                transform: 'rotateX(60deg) rotateZ(45deg) scale(3)',
                            }} 
                        />
                        <div className="relative w-full h-full flex items-center justify-center" style={{ transform: 'scale(0.8) translateY(20px)' }}>
                            <div className="grid grid-cols-4 gap-4">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className={`w-10 h-12 border border-white/10 rounded relative ${i % 5 === 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5'}`}>
                                        <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${i % 5 === 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'topology':
                return (
                    <div className="w-full h-full flex items-center justify-center relative bg-black/40">
                        <div className="relative w-48 h-48">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border border-white/5 rounded-full"
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--theme-primary)] rounded-full shadow-[0_0_10px_var(--theme-primary)]" />
                                </motion.div>
                            ))}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]" />
                            </div>
                        </div>
                    </div>
                );

            case 'point-cloud':
                return (
                    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-black/40">
                        <div className="grid grid-cols-10 gap-2 opacity-40">
                            {[...Array(100)].map((_, i) => (
                                <motion.div 
                                    key={i}
                                    animate={{ 
                                        opacity: [0.1, 0.5, 0.1],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ delay: Math.random() * 2, duration: 2, repeat: Infinity }}
                                    className="w-1 h-1 bg-[var(--theme-primary)] rounded-full"
                                />
                            ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">High Density Scan</span>
                        </div>
                    </div>
                );

            case 'map-density':
                return (
                    <div className="w-full h-full relative overflow-hidden bg-black/40">
                        <div className="absolute inset-0 flex flex-wrap">
                            {[...Array(400)].map((_, i) => {
                                const opacity = Math.sin(i * 0.1) * 0.2 + 0.1;
                                return <div key={i} className="w-[5%] h-[5%] border-[0.5px] border-white/5" style={{ opacity }} />;
                            })}
                        </div>
                        <motion.div 
                            animate={{ x: [-100, 300], y: [-50, 200] }}
                            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
                            className="absolute w-32 h-32 bg-[var(--theme-primary)]/20 blur-[60px] rounded-full"
                        />
                    </div>
                );

            case 'hologram':
                return (
                    <div className="w-full h-full flex items-center justify-center bg-black/40 overflow-hidden">
                        <div className="relative w-40 h-40 border border-white/5 rotate-45">
                            <div className="absolute inset-0 border-t-2 border-[var(--theme-primary)]/40 animate-[scan_2s_linear_infinite]" />
                            <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-20 h-20 border-2 border-white/10 rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'globe':
                return (
                    <div className="w-full h-full flex items-center justify-center relative bg-black/40">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="w-32 h-32 rounded-full border border-white/10 relative"
                        >
                            <div className="absolute inset-0 rounded-full border-t border-[var(--theme-primary)]/40" />
                            <div className="absolute inset-4 rounded-full border border-white/5" />
                        </motion.div>
                    </div>
                );

            default:
                return (
                    <div className="w-full h-full flex items-center justify-center text-white/20 uppercase font-black text-[10px] tracking-widest bg-black/40">
                        {type} technical view
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full backdrop-blur-sm relative transition-all duration-700">
            {renderVisual()}
        </div>
    );
};

export default SarakVisualEngine;
