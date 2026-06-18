import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Activity } from 'lucide-react';

interface AuthHeroProps {
    branding?: {
        name: string;
        logo?: string;
    };
}

export const AuthHero: React.FC<AuthHeroProps> = ({ branding }) => {
    return (
        <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-theme-body via-theme-body to-theme-primary/20 items-center justify-center p-12">
            {/* Animated Decorative Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-theme-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-theme-secondary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
            </div>

            {/* Visual Grid */}
            <div 
                className="absolute inset-0 opacity-[var(--sarak-noise-opacity,0.2)] mix-blend-overlay pointer-events-none"
                style={{ 
                    backgroundImage: 'var(--sarak-auth-noise-url)',
                    display: 'var(--sarak-auth-noise-enabled, block)'
                }}
            ></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--sx-color-border-base) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div 
                className="relative z-10 max-w-xl text-center flex flex-col items-center"
                style={{ gap: 'var(--sarak-auth-gap, 2rem)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="w-24 h-24 bg-gradient-to-tr from-theme-primary to-theme-primary/60 flex items-center justify-center shadow-2xl shadow-lg-primary/20 border border-[var(--sx-color-border-base)]-border"
                    style={{ borderRadius: 'var(--button-radius, 12px)' }}
                >
                    {branding?.logo ? (
                        <img src={branding.logo} alt="Logo" className="w-12 h-12 object-contain" />
                    ) : (
                        <Cpu className="w-12 h-12 text-theme-title" />
                    )}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-6xl font-black tracking-tighter bg-gradient-to-r from-theme-primary via-white to-theme-primary bg-[length:200%_auto] animate-gradient-text bg-clip-text text-transparent uppercase"
                >
                    {branding?.name}
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="mt-12 flex gap-4"
                >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full sarak-glass bg-[var(--sx-color-surface-base)] border border-[var(--sx-color-border-base)]-border backdrop-blur-md">
                        <ShieldCheck className="w-4 h-4 text-theme-secondary" />
                        <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">Secure</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full sarak-glass bg-[var(--sx-color-surface-base)] border border-[var(--sx-color-border-base)]-border backdrop-blur-md">
                        <Activity className="w-4 h-4 text-theme-primary" />
                        <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">Neural</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
