import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap } from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { DiscoveredModule } from '../../../core/Discovery/types';
import { DynamicRenderer } from '../../Discovery/DynamicRenderer';
import { SarakEmptyState } from '../../../components/atomic/Feedback/SarakEmptyState';
import { UIContext } from '../../Provider/SarakUIProvider';

interface ShellContentProps {
    activeModule: DiscoveredModule | undefined;
    discoveredModules: DiscoveredModule[];
    design: any;
    user: any;
    authApi: any;
    setIsSearchOpen: (open: boolean) => void;
}

export const ShellContent: React.FC<ShellContentProps> = ({
    activeModule, discoveredModules, design, user, authApi, setIsSearchOpen
}) => {
    const { texture, layoutGap, isSplitViewEnabled, secondaryModuleId, emptyStateId } = design || {};

    const transitionEffect = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <main className={`flex-1 overflow-y-auto custom-scrollbar relative flex flex-col w-full min-h-0 isolate ${texture !== 'none' ? 'texture-active' : 'bg-[var(--theme-body)]'}`} data-sx-texture={texture}>

            <div className="flex-1 flex flex-col relative w-full pt-8 lg:pt-12 z-10 transition-all duration-500 min-h-0" style={{ gap: `var(--theme-gap, ${layoutGap}px)`, padding: `var(--safe-area-padding, 0)` }}>
                <AnimatePresence mode="wait">
                    {activeModule ? (
                        <motion.div 
                            key={activeModule.id} 
                            {...transitionEffect}
                            className="pb-12 flex flex-col min-h-full" 
                            style={{ paddingLeft: 'var(--theme-pad)', paddingRight: 'var(--theme-pad)' }}
                        >
                            
                            <header className="mb-10 flex items-end justify-between border-b border-[var(--theme-border)]/50 pb-8 shrink-0">
                                <div>
                                    <div className="flex items-center gap-3 text-[var(--theme-primary)] mb-2">
                                        <div className="p-2 rounded-[var(--radius-theme)] bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.1)]"><IconRenderer name={activeModule.icon} size={20} /></div>
                                        <span className="text-2xs font-black uppercase tracking-[0.4em] italic opacity-60 text-[var(--theme-muted)]">{activeModule.category || 'Module'}</span>
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-[var(--theme-title)] uppercase">{activeModule.label}</h1>
                                </div>
                            </header>

                            <div className={`flex-1 ${isSplitViewEnabled ? 'grid grid-cols-2 gap-[var(--theme-gap)]' : 'flex flex-col'} animate-in fade-in zoom-in-95 duration-700`}>
                                    {(() => {
                                        const ModComponent = (activeModule as any)?.component;
                                        const contracts = activeModule.visualContracts;

                                        if (ModComponent) {
                                            return (
                                                <ModComponent 
                                                    modules={discoveredModules} 
                                                    user={user}
                                                    authApi={authApi}
                                                />
                                            );
                                        }

                                        if (contracts && contracts.length > 0) {
                                            return <DynamicRenderer contracts={contracts} module={activeModule} />;
                                        }

                                        return <div className="opacity-20 flex items-center justify-center h-full text-[var(--theme-muted)] uppercase font-black text-xs tracking-widest">Module in API Mode (No Local Interface)</div>;
                                    })()}
                                {isSplitViewEnabled && secondaryModuleId && (
                                    <div className="flex flex-col min-h-full border-l border-[var(--theme-border)]/30 pl-[var(--theme-gap)]">
                                        {(() => {
                                            const SecMod = (discoveredModules.find(m => m.id === secondaryModuleId) as any)?.component;
                                            return SecMod ? <SecMod /> : <div className="opacity-20 flex items-center justify-center h-full text-[var(--theme-muted)]">Select a secondary module</div>;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center p-12"><SarakEmptyState type={(emptyStateId || 'default') as any} /></motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

