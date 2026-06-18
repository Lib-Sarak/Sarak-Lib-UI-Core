import React from 'react';
import { DeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { SidebarNav } from '../../../../core/Shell/Components/SidebarNav';
import { TopbarNav } from '../../../../core/Shell/Components/TopbarNav';
import { DockNav } from '../../../../core/Shell/Components/DockNav';

export const PreviewSystemRenderer: React.FC<any> = ({
    useSystemDesign = false,
    sarak,
    tokens,
    isDualView,
    previewDevice,
    previewNavVisible,
    setPreviewNavVisible,
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
                    className={`absolute inset-0 origin-top-left overflow-hidden z-10 flex text-[var(--theme-text)] font-sans selection:bg-[var(--theme-primary)] selection:text-white layout-${navStyle} ${activeDesign.globalBackgroundImageUrl ? 'bg-transparent' : 'bg-[var(--theme-body)]'}`}
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

                    {isSidebar && (
                        <SidebarNav
                            design={activeDesign}
                            brand={{ name: activeDesign.systemName || "Sarak Preview" }}
                            user={parentContext?.options?.user || { displayName: 'Sarak User', primaryEmail: 'preview@sarak.io' }}
                            logout={() => { }}
                            toggleNav={() => onUpdateDraft('isNavHidden', !activeDesign.isNavHidden)}
                            activeModuleId={activePreviewApp}
                            setActiveModuleId={setActivePreviewApp}
                            groupedModules={mockGroupedModules}
                            setIsNavVisible={setPreviewNavVisible}
                            setIsSearchOpen={() => { }}
                            startResizing={startResizingSidebar as any}
                        />
                    )}

                    {isDock && (
                        <DockNav
                            design={activeDesign}
                            discoveredModules={mockDiscoveredModules}
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
                                discoveredModules={mockDiscoveredModules}
                                user={parentContext?.options?.user || { displayName: 'Sarak User', primaryEmail: 'preview@sarak.io' }}
                                logout={() => { }}
                                startResizing={startResizingTopbar as any}
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
