import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Activity } from 'lucide-react';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

interface AuthHeroProps {
    branding?: {
        name: string;
        logo?: string;
    };
}

export const AuthHero: React.FC<AuthHeroProps> = ({ branding }) => {
    const { getFlexStyles } = useStructuralStyles();

    return (
        <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-theme-body via-theme-body to-theme-primary/20 items-center justify-center" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px)*3)' }}>
            {/* Animated Decorative Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-theme-primary/20 rounded-full blur-[var(--sarak-auth-hero-orb-blur,120px)] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-theme-secondary/10 rounded-full blur-[var(--sarak-auth-hero-orb-blur,120px)] animate-pulse [animation-delay:2s]"></div>
            </div>

            {/* Visual Grid */}
            <div 
                className="absolute inset-0 opacity-[var(--sarak-noise-opacity,0.2)] mix-blend-overlay pointer-events-none"
                style={{ 
                    backgroundImage: 'url("/noise.png")',
                    display: '1'
                }}
            ></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at var(--sarak-dot-grid-dot-offset, 2px) var(--sarak-dot-grid-dot-offset, 2px), var(--border-color,#334155) var(--sarak-dot-grid-dot-size, 1px), transparent 0)', backgroundSize: 'var(--sarak-dot-grid-tile-size, 40px) var(--sarak-dot-grid-tile-size, 40px)' }}></div>

            <div 
                className={`relative z-10 max-w-xl text-center ${getFlexStyles('column', 'center', 'center', 'var(--sarak-layout-gap-md, 16px)').className}`}
                style={getFlexStyles('column', 'center', 'center', 'var(--sarak-layout-gap-md, 16px)').style}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="w-24 h-24 bg-gradient-to-tr from-theme-primary to-theme-primary/60 flex items-center justify-center shadow-2xl shadow-lg-primary/20 border border-[var(--border-color,#334155)]-border"
                    style={{ borderRadius: 'var(--radius-btn, 12px)' }}
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
                    className={getFlexStyles('row', 'center', 'center', 'var(--sarak-layout-gap-md,16px)').className}
                    style={{ ...getFlexStyles('row', 'center', 'center', 'var(--sarak-layout-gap-md,16px)').style, marginTop: 'calc(var(--sarak-layout-gap-md,16px)*3)' }}
                >
                    <div className="flex items-center rounded-full sarak-glass bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)]-border backdrop-blur-md" style={{ padding: 'var(--sarak-layout-gap-sm,8px) var(--sarak-layout-gap-md,16px)', gap: 'var(--sarak-layout-gap-sm,8px)' }}>
                        <ShieldCheck className="w-4 h-4 text-theme-secondary" />
                        <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">Secure</span>
                    </div>
                    <div className="flex items-center rounded-full sarak-glass bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)]-border backdrop-blur-md" style={{ padding: 'var(--sarak-layout-gap-sm,8px) var(--sarak-layout-gap-md,16px)', gap: 'var(--sarak-layout-gap-sm,8px)' }}>
                        <Activity className="w-4 h-4 text-theme-primary" />
                        <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">Neural</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
