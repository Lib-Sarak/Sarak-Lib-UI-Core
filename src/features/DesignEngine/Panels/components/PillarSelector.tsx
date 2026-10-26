import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { SOVEREIGN_PILLARS } from '../hooks/useSovereignSearch';

interface PillarSelectorProps {
    searchQuery: string;
    activePillar: string;
    setActivePillar: (pillarId: string) => void;
    setActiveSection: (sectionId: string | null) => void;
    pillarsWithDrafts: string[];
    resetComponent: (schemas: string[]) => void;
    filteredComponentsLength: number;
}

export const PillarSelector: React.FC<PillarSelectorProps> = ({
    searchQuery,
    activePillar,
    setActivePillar,
    setActiveSection,
    pillarsWithDrafts,
    resetComponent,
    filteredComponentsLength
}) => {
    return (
        <AnimatePresence mode="wait">
            {!searchQuery ? (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between gap-1 p-1 bg-theme-text/5 rounded-xl border border-theme-text/5"
                >
                    {SOVEREIGN_PILLARS.map((pillar: { id: string; label: string; icon: React.ElementType; schemas: string[] }) => {
                        const Icon = pillar.icon;
                        const isActive = activePillar === pillar.id;
                        const hasDraft = pillarsWithDrafts.includes(pillar.id);

                        return (
                            <button
                                key={pillar.id}
                                onClick={() => {
                                    setActivePillar(pillar.id);
                                    setActiveSection(null);
                                }}
                                className={`relative flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg transition-all ${
                                    isActive 
                                        ? 'bg-[var(--theme-primary)] text-theme-on-primary shadow-lg' 
                                        : 'hover:bg-theme-text/5 text-theme-text/30 hover:text-theme-text/60'
                                }`}
                                title={pillar.label}
                            >
                                <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                                <span className="text-[var(--sarak-type-scale-tiny,11px)] font-black uppercase tracking-tighter">{pillar.label}</span>
                                
                                {hasDraft && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            resetComponent(pillar.schemas);
                                        }}
                                        className={`absolute top-1 right-1 p-0.5 rounded-full transition-all ${isActive ? 'bg-theme-body text-[var(--theme-primary)] hover:scale-110' : 'bg-[var(--theme-primary)] text-theme-body animate-pulse hover:animate-none hover:scale-110'}`}
                                        title="Resetar Pilar"
                                    >
                                        <RotateCcw size={8} strokeWidth={4} />
                                    </button>
                                )}
                            </button>
                        );
                    })}
                </motion.div>
            ) : (
                <div className="flex items-center gap-2 py-2">
                            <span className="text-[var(--sarak-type-scale2xs,11px)] font-black uppercase text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-2 py-0.5 rounded-full">
                        {filteredComponentsLength} Categorias em foco
                    </span>
                </div>
            )}
        </AnimatePresence>
    );
};
