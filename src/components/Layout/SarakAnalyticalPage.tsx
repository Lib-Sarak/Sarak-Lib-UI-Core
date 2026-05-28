import React, { ReactNode, useState } from 'react';
import { useSarakDevice } from '../../core/Provider/DeviceProvider';
import { SarakHidden } from './SarakHidden';

export interface SarakAnalyticalPageProps {
    navBar?: ReactNode;
    mainContent: ReactNode;
    sidePanel?: ReactNode;
    /** Se true, o painel lateral abre como um modal/drawer por cima no mobile. Se false, fica empilhado. Default: true */
    sidePanelAsDrawerOnMobile?: boolean;
}

/**
 * SarakAnalyticalPage
 * 
 * Uma Fôrma Inteligente (Smart Layout) para telas de dashboard/análise.
 * No Desktop: Distribui navBar, mainContent e sidePanel em colunas.
 * No Mobile: Oculta navBar ou transforma em modal, empilha mainContent e transforma sidePanel em BottomSheet/Drawer.
 */
export const SarakAnalyticalPage: React.FC<SarakAnalyticalPageProps> = ({ 
    navBar, 
    mainContent, 
    sidePanel,
    sidePanelAsDrawerOnMobile = true
}) => {
    const device = useSarakDevice();
    const isMobile = device === 'smartphone';
    const isTablet = device === 'tablet';

    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    if (isMobile) {
        return (
            <div className="flex flex-col w-full h-full relative">
                {/* Mobile Header (Auto-generated Se houver navBar ou sidePanel para controlar) */}
                {(navBar || sidePanel) && (
                    <div className="flex items-center justify-between p-4 border-b border-[var(--sarak-border)] bg-[var(--sarak-bg-layer)] z-20 shrink-0">
                        {navBar ? (
                            <button 
                                onClick={() => setIsMobileNavOpen(true)}
                                className="p-2 rounded-lg bg-[var(--sarak-bg-layer)] hover:bg-[var(--sarak-bg-hover)] transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            </button>
                        ) : <div />}
                        
                        {sidePanel && (
                            <button 
                                onClick={() => setIsSidePanelOpen(true)}
                                className="p-2 rounded-lg bg-[var(--sarak-bg-layer)] hover:bg-[var(--sarak-bg-hover)] transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative z-10">
                    {mainContent}
                    {/* Se não for modo drawer, empilha o side panel no final */}
                    {!sidePanelAsDrawerOnMobile && sidePanel && (
                        <div className="mt-8 border-t border-[var(--sarak-border)] pt-4">
                            {sidePanel}
                        </div>
                    )}
                </div>

                {/* Mobile Nav Drawer */}
                {navBar && isMobileNavOpen && (
                    <div className="absolute inset-0 z-50 flex">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
                        <div className="relative w-4/5 max-w-sm h-full bg-[var(--sarak-bg-base)] border-r border-[var(--sarak-border)] shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-left">
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsMobileNavOpen(false)} className="p-2">✕</button>
                            </div>
                            {navBar}
                        </div>
                    </div>
                )}

                {/* Mobile Side Panel (Bottom Sheet / Right Drawer) */}
                {sidePanel && sidePanelAsDrawerOnMobile && isSidePanelOpen && (
                    <div className="absolute inset-0 z-50 flex justify-end">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidePanelOpen(false)} />
                        <div className="relative w-4/5 max-w-sm h-full bg-[var(--sarak-bg-base)] border-l border-[var(--sarak-border)] shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-right">
                            <div className="flex justify-start mb-4">
                                <button onClick={() => setIsSidePanelOpen(false)} className="p-2">✕</button>
                            </div>
                            {sidePanel}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // DESKTOP & TABLET Layout
    return (
        <div className="flex w-full h-full gap-[var(--sarak-layout-gap,1.5rem)]">
            {navBar && (
                <div className={`shrink-0 flex flex-col ${isTablet ? 'w-48' : 'w-64'}`}>
                    {navBar}
                </div>
            )}
            
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {mainContent}
            </div>

            {sidePanel && (
                <div className={`shrink-0 flex flex-col ${isTablet ? 'w-64' : 'w-80'}`}>
                    {sidePanel}
                </div>
            )}
        </div>
    );
};
