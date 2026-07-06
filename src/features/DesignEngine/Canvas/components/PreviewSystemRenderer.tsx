import React from 'react';
import { DeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { SidebarNav } from '../../../../core/Shell/Components/SidebarNav';
import { TopbarNav } from '../../../../core/Shell/Components/TopbarNav';
import { DockNav } from '../../../../core/Shell/Components/DockNav';
import { DiscoveredModule } from '../../../../core/Discovery/types';
import { SarakUIContextType } from '../../../../core/Provider/types';
import { SarakDesignState } from '../../../../core/Provider/types';
import { SarakTokenValue } from '../../../../core/Design/types';

export interface PreviewSystemRendererProps {
    useSystemDesign?: boolean;
    sarak: SarakUIContextType;
    tokens: Partial<SarakDesignState>;
    isDualView?: boolean;
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    previewNavVisible: boolean;
    setPreviewNavVisible: (v: boolean) => void;
    previewMobileNavOpen: boolean;
    setPreviewMobileNavOpen: (v: boolean) => void;
    isSidebar: boolean;
    isDock: boolean;
    isTopbar: boolean;
    parentContext: SarakUIContextType;
    activePreviewApp: string;
    setActivePreviewApp: (app: string) => void;
    onUpdateDraft: (key: string, value: SarakTokenValue) => void;
    mockGroupedModules: Record<string, unknown[]>;
    mockDiscoveredModules: unknown[];
    startResizingSidebar: () => void;
    startResizingTopbar: () => void;
    apps: Record<string, React.ReactNode>;
}

export const PreviewSystemRenderer: React.FC<PreviewSystemRendererProps> = ({
    useSystemDesign = false,
    sarak,
    tokens,
    isDualView,
    previewDevice,
    previewNavVisible,
    setPreviewNavVisible,
    previewMobileNavOpen,
    setPreviewMobileNavOpen,
    isSidebar,
    isDock,
    isTopbar,
    parentContext,
    activePreviewApp,
    setActivePreviewApp,
    onUpdateDraft,
    mockGroupedModules,
    mockDiscoveredModules,
    startResizingSidebar,
    startResizingTopbar,
    apps
}) => {
    const activeDesign = useSystemDesign ? (sarak?.design || {}) : tokens;
    const navStyle = activeDesign.navigationStyle || 'sidebar';
    const hasTexture = activeDesign.texture && activeDesign.texture !== 'none';
    const isMobile = previewDevice === 'smartphone';

    const scaleFactor = isDualView ? 0.75 : 0.95;
    const widthPercent = `${(100 / scaleFactor).toFixed(2)}%`;
    const heightPercent = `${(100 / scaleFactor).toFixed(2)}%`;

    return (
        <DeviceProvider overrideDevice={previewDevice}>
            <DesignScope
                design={activeDesign}
                className={`@container sarak-device-${previewDevice} w-full h-full flex flex-col transition-all duration-500 overflow-hidden relative isolate ${hasTexture ? 'texture-active' : ''}`}
                data-sx-texture={activeDesign.texture}
            >
                <div
                    className={`absolute inset-0 z-0 ${activeDesign.globalBackgroundImageUrl ? 'bg-transparent' : 'bg-[var(--sarak-bg-base)]'}`}
                    style={{ backgroundColor: activeDesign.globalBackgroundImageUrl ? 'transparent' : 'var(--sarak-bg-base)' }}
                />

                <div
                    className={`absolute inset-0 origin-top-left overflow-hidden z-10 flex text-[var(--color-theme-title,#ffffff)] font-sans selection:bg-[var(--theme-primary)] selection:text-white layout-${navStyle} ${activeDesign.globalBackgroundImageUrl ? 'bg-transparent' : 'bg-[var(--theme-body)]'}`}
                    style={{
                        width: widthPercent,
                        height: heightPercent,
                        transform: `scale(${scaleFactor})`
                    }}
                >
                    {activeDesign.isAutoHideEnabled && !previewNavVisible && (
                        <>
                            {isSidebar && (
                                <div
                                    onMouseEnter={() => setPreviewNavVisible(true)}
                                    className="absolute left-0 top-0 w-4 h-full z-[1000] cursor-pointer"
                                />
                            )}
                            {isDock && (
                                <div
                                    onMouseEnter={() => setPreviewNavVisible(true)}
                                    className="absolute bottom-0 left-0 w-full h-8 z-[1000] cursor-pointer"
                                />
                            )}
                        </>
                    )}

                    {isSidebar && !isMobile && (
                        <SidebarNav
                            design={activeDesign}
                            brand={{ name: activeDesign.systemName || "Sarak Preview" }}
                            user={(parentContext?.options as { user?: { displayName?: string; primaryEmail?: string } })?.user || { displayName: 'Sarak User', primaryEmail: 'preview@sarak.io' }}
                            logout={() => { }}
                            toggleNav={() => onUpdateDraft('isNavHidden', !activeDesign.isNavHidden)}
                            activeModuleId={activePreviewApp}
                            setActiveModuleId={setActivePreviewApp}
                            groupedModules={mockGroupedModules as unknown as Record<string, DiscoveredModule[]>}
                            setIsNavVisible={setPreviewNavVisible}
                            setIsSearchOpen={() => { }}
                            startResizing={startResizingSidebar}
                        />
                    )}

                    {isMobile && isSidebar && (
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)] bg-[var(--theme-sidebar)] z-20 shrink-0 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPreviewMobileNavOpen(true)}
                                    className="p-1.5 -ml-1.5 rounded-md text-[var(--theme-muted)] hover:text-[var(--theme-title)] hover:bg-[var(--theme-primary)]/10 transition-colors"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                                </button>
                                <span className="font-bold tracking-tight text-[var(--theme-title)] truncate">
                                    {activeDesign.systemName || "Sarak Preview"}
                                </span>
                            </div>
                        </div>
                    )}

                    {isMobile && isSidebar && previewMobileNavOpen && (
                        <div className="absolute inset-0 z-[9999] flex">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setPreviewMobileNavOpen(false)} />
                            <div className="relative w-4/5 max-w-sm h-full flex flex-col bg-[var(--theme-sidebar)] shadow-2xl animate-in slide-in-from-left duration-300">
                                <SidebarNav
                                    design={{ ...activeDesign, isNavHidden: false, isAutoHideEnabled: false }}
                                    brand={{ name: activeDesign.systemName || "Sarak Preview" }}
                                    user={(parentContext?.options as { user?: { displayName?: string; primaryEmail?: string } })?.user || { displayName: 'Sarak User', primaryEmail: 'preview@sarak.io' }}
                                    logout={() => { }}
                                    toggleNav={() => setPreviewMobileNavOpen(false)}
                                    activeModuleId={activePreviewApp}
                                    setActiveModuleId={setActivePreviewApp}
                                    groupedModules={mockGroupedModules as unknown as Record<string, DiscoveredModule[]>}
                                    setIsNavVisible={setPreviewNavVisible}
                                    setIsSearchOpen={() => { }}
                                    startResizing={() => { }}
                                    isMobileDrawer={true}
                                />
                            </div>
                        </div>
                    )}

                    {isDock && (
                        <DockNav
                            design={activeDesign}
                            discoveredModules={mockDiscoveredModules as unknown as DiscoveredModule[]}
                            activeModuleId={activePreviewApp}
                            setActiveModuleId={setActivePreviewApp}
                            setIsSearchOpen={() => { }}
                            isNavVisible={previewNavVisible}
                            setIsNavVisible={setPreviewNavVisible}
                        />
                    )}

                    <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${activeDesign.globalBackgroundImageUrl ? 'bg-transparent' : 'bg-[var(--theme-body)]'}`}>
                        {isTopbar && (
                            <TopbarNav
                                design={activeDesign}
                                brand={{ name: activeDesign.systemName || "Sarak Preview" }}
                                toggleNav={() => onUpdateDraft('isNavHidden', !activeDesign.isNavHidden)}
                                setIsSearchOpen={() => { }}
                                activeModuleId={activePreviewApp}
                                setActiveModuleId={setActivePreviewApp}
                                discoveredModules={mockDiscoveredModules as unknown as DiscoveredModule[]}
                                user={(parentContext?.options as { user?: { displayName?: string; primaryEmail?: string } })?.user || { displayName: 'Sarak User', primaryEmail: 'preview@sarak.io' }}
                                logout={() => { }}
                                startResizing={startResizingTopbar}
                            />
                        )}

                        <main
                            className={`flex-1 overflow-y-auto p-12 relative z-10 bg-transparent custom-scrollbar isolate ${hasTexture ? 'texture-active' : ''}`}
                            data-sx-texture={activeDesign.texture}
                        >
                            <div className="relative z-10">
                                {apps[activePreviewApp]}
                            </div>
                        </main>
                    </div>
                </div>
            </DesignScope>
        </DeviceProvider>
    );
};
