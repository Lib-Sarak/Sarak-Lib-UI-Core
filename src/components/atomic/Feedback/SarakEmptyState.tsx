import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../Icon/SarakIcon';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

export interface SarakEmptyStateProps {
    /** Escolhe a composição visual (`minimal`, `abstract` ou `geometric`); sem a prop, usa `abstract`. */
    type?: 'minimal' | 'abstract' | 'geometric';
    /** Conteúdo principal do estado; quando informado, ativa a composição de conteúdo. */
    title?: React.ReactNode;
    /** Explicação complementar para o estado vazio. */
    description?: React.ReactNode;
    /** Ação composta pelo consumidor, normalmente um `SarakButton`. */
    action?: React.ReactNode;
    /** Ícone ou ilustração composta pelo consumidor. */
    icon?: React.ReactNode;
}

const EMPTY_STATE_STAGGER_SECONDS = 0.1;
const EMPTY_STATE_ITEM_OFFSET_Y = 20;
const GEOMETRIC_ORBIT_ROTATION_DEGREES = 360;
const GEOMETRIC_ORBIT_DURATION_SECONDS = 60;
const ABSTRACT_ORBIT_ROTATION_DEGREES = -360;
const ABSTRACT_ORBIT_DURATION_SECONDS = 20;
const ABSTRACT_GLOW_DURATION_SECONDS = 4;
const EMPTY_STATE_CONTAINER_VARIANTS = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: EMPTY_STATE_STAGGER_SECONDS } },
};
const EMPTY_STATE_ITEM_VARIANTS = {
    initial: { opacity: 0, y: EMPTY_STATE_ITEM_OFFSET_Y },
    animate: { opacity: 1, y: 0 },
};

const hasCustomContent = ({ title, description, action, icon }: SarakEmptyStateProps): boolean =>
    [title, description, action, icon].some((content) => content !== undefined);

const CustomEmptyState = ({ title, description, action, icon }: SarakEmptyStateProps): React.ReactElement => (
    <motion.div
        role="status"
        variants={EMPTY_STATE_CONTAINER_VARIANTS}
        initial="initial"
        animate="animate"
        className="flex h-full items-center justify-center text-center"
        style={{ flexDirection: 'column', padding: 'var(--sarak-layout-gap-lg, 24px)' }}
    >
        {icon !== undefined && <motion.div variants={EMPTY_STATE_ITEM_VARIANTS} style={{ marginBottom: 'var(--sarak-layout-gap-md, 16px)' }}>{icon}</motion.div>}
        {title !== undefined && <motion.h2 variants={EMPTY_STATE_ITEM_VARIANTS} className="text-lg font-bold text-[var(--color-theme-title,#ffffff)]">{title}</motion.h2>}
        {description !== undefined && <motion.p variants={EMPTY_STATE_ITEM_VARIANTS} className="text-sm text-[var(--text-muted,#94a3b8)]" style={{ marginTop: 'var(--sarak-layout-gap-sm, 8px)' }}>{description}</motion.p>}
        {action !== undefined && <motion.div variants={EMPTY_STATE_ITEM_VARIANTS} style={{ marginTop: 'var(--sarak-layout-gap-md, 16px)' }}>{action}</motion.div>}
    </motion.div>
);

const MinimalEmptyState = ({ systemLabel, caption }: { systemLabel: string; caption: string }): React.ReactElement => (
    <motion.div variants={EMPTY_STATE_CONTAINER_VARIANTS} initial="initial" animate="animate" className="flex items-center justify-center h-full opacity-20 grayscale" style={{ flexDirection: 'column' }}>
        <motion.div variants={EMPTY_STATE_ITEM_VARIANTS} className="pointer-events-none" style={{ marginBottom: 'var(--sarak-layout-gap-lg, 24px)' }}>
            <SarakIcon name="Compass" size={64} strokeWidth={1} />
        </motion.div>
        <motion.h2 variants={EMPTY_STATE_ITEM_VARIANTS} className="text-xl font-bold uppercase" style={{ letterSpacing: 'var(--sarak-tracking-widest, 0.5em)' }}>{systemLabel}</motion.h2>
        <motion.p variants={EMPTY_STATE_ITEM_VARIANTS} className="text-2xs uppercase tracking-widest italic" style={{ marginTop: 'var(--sarak-layout-gap-sm, 8px)' }}>{caption}</motion.p>
    </motion.div>
);

const GeometricOrbit: React.FC = (): React.ReactElement => (
    <motion.div
        animate={{ rotate: GEOMETRIC_ORBIT_ROTATION_DEGREES }}
        transition={{ duration: GEOMETRIC_ORBIT_DURATION_SECONDS, repeat: Infinity, ease: 'linear' }}
        className="w-[var(--sarak-empty-state-orb-outer,500px)] h-[var(--sarak-empty-state-orb-outer,500px)] border border-dashed border-white/5 rounded-full flex items-center justify-center relative"
    >
        <div className="w-[var(--sarak-empty-state-orb-inner,300px)] h-[var(--sarak-empty-state-orb-inner,300px)] border border-dashed border-white/10 rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--sarak-primary-color,#3b82f6)] shadow-[0_0_15px_var(--sarak-primary-color,#3b82f6)]" />
    </motion.div>
);

const GeometricCaption = ({ title, caption }: { title: string; caption: string }): React.ReactElement => (
    <div className="absolute z-10 text-center">
        <motion.div variants={EMPTY_STATE_ITEM_VARIANTS} className="text-[var(--sarak-primary-color,#3b82f6)] mx-auto w-12 h-12 flex items-center justify-center" style={{ marginBottom: 'var(--sarak-layout-gap-lg, 24px)' }}>
            <SarakIcon name="Box" size={40} strokeWidth={1} />
        </motion.div>
        <motion.h2 variants={EMPTY_STATE_ITEM_VARIANTS} className="text-2xl font-black uppercase text-white/10" style={{ letterSpacing: 'var(--sarak-tracking-ultra, 0.8em)', marginLeft: 'var(--sarak-empty-state-void-letter-offset, 0.8em)' }}>{title}</motion.h2>
        <motion.p variants={EMPTY_STATE_ITEM_VARIANTS} className="text-2xs uppercase text-[var(--sarak-primary-color,#3b82f6)]/40 font-bold" style={{ marginTop: 'var(--sarak-layout-gap-md, 16px)', letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>{caption}</motion.p>
    </div>
);

const GeometricEmptyState = ({ primaryColor, title, caption }: { primaryColor?: string; title: string; caption: string }): React.ReactElement => (
    <motion.div variants={EMPTY_STATE_CONTAINER_VARIANTS} initial="initial" animate="animate" className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ flexDirection: 'column' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at var(--sarak-dot-grid-dot-offset, 2px) var(--sarak-dot-grid-dot-offset, 2px), ${primaryColor} var(--sarak-dot-grid-dot-size, 1px), transparent 0)`, backgroundSize: 'var(--sarak-dot-grid-tile-size, 40px) var(--sarak-dot-grid-tile-size, 40px)' }} />
        <GeometricOrbit />
        <GeometricCaption title={title} caption={caption} />
    </motion.div>
);

const AbstractArtwork: React.FC = (): React.ReactElement => (
    <>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: ABSTRACT_GLOW_DURATION_SECONDS, repeat: Infinity }} className="absolute w-[var(--sarak-empty-state-orb-inner,300px)] h-[var(--sarak-empty-state-orb-inner,300px)] rounded-full bg-[var(--sarak-primary-color,#3b82f6)]/5 blur-[var(--sarak-empty-state-orb-blur,100px)]" />
        <motion.div variants={EMPTY_STATE_ITEM_VARIANTS} className="relative" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 2)' }}>
            <div className="relative z-10 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl" style={{ padding: 'var(--sarak-layout-gap-lg, 24px)' }}>
                <SarakIcon name="Sparkles" size={48} className="text-[var(--sarak-primary-color,#3b82f6)] animate-pulse" />
            </div>
            <motion.div animate={{ rotate: ABSTRACT_ORBIT_ROTATION_DEGREES }} transition={{ duration: ABSTRACT_ORBIT_DURATION_SECONDS, repeat: Infinity, ease: 'linear' }} className="absolute -inset-4 border border-white/5 rounded-[var(--sarak-empty-state-ring-radius,2rem)] border-dashed" />
        </motion.div>
    </>
);

const AbstractCaption = ({ systemLabel, firstLine, secondLine }: { systemLabel: string; firstLine: string; secondLine: string }): React.ReactElement => (
    <motion.div variants={EMPTY_STATE_ITEM_VARIANTS} className="text-center z-10">
        <h2 className="text-sm font-black uppercase text-white/40" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)', letterSpacing: 'var(--sarak-tracking-wider, 0.4em)' }}>{systemLabel}</h2>
        <div className="h-px w-12 bg-[var(--sarak-primary-color,#3b82f6)]/40 mx-auto" style={{ marginBottom: 'var(--sarak-layout-gap-md, 16px)' }} />
        <p className="text-2xs text-white/20 uppercase tracking-widest max-w-[var(--sarak-empty-state-caption-max-width,280px)] leading-loose">{firstLine} <br />{secondLine}</p>
    </motion.div>
);

const AbstractEmptyState = ({ systemLabel, firstLine, secondLine }: { systemLabel: string; firstLine: string; secondLine: string }): React.ReactElement => (
    <motion.div variants={EMPTY_STATE_CONTAINER_VARIANTS} initial="initial" animate="animate" className="flex items-center justify-center h-full relative" style={{ flexDirection: 'column' }}>
        <AbstractArtwork />
        <AbstractCaption systemLabel={systemLabel} firstLine={firstLine} secondLine={secondLine} />
    </motion.div>
);

export const SarakEmptyState = (props: SarakEmptyStateProps): React.ReactElement => {
    const { design } = useSarakUIOptional() || {};
    const text = useLibraryText();
    if (hasCustomContent(props)) return <CustomEmptyState {...props} />;
    const systemLabel = design?.systemName || text('genericSystemLabel');
    if (props.type === 'minimal') return <MinimalEmptyState systemLabel={systemLabel} caption={text('emptyStateMinimalCaption')} />;
    if (props.type === 'geometric') return <GeometricEmptyState primaryColor={design?.primaryColor} title={text('emptyStateGeometricTitle')} caption={text('emptyStateGeometricCaption')} />;
    return <AbstractEmptyState systemLabel={systemLabel} firstLine={text('emptyStateAbstractCaptionLine1')} secondLine={text('emptyStateAbstractCaptionLine2')} />;
};
