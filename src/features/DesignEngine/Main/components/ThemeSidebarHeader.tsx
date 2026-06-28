import React from 'react';
import { Zap, Monitor, Tablet, Smartphone, Check, Search, Table, FileJson } from 'lucide-react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakIconButton } from '../../../../components/atomic/Buttons/SarakIconButton';

interface ThemeSidebarHeaderProps {
    viewMode: 'preview' | 'catalog' | 'templates';
    setViewMode: (mode: 'preview' | 'catalog' | 'templates') => void;
    isDirty: boolean;
    setIsSaveModalOpen: (open: boolean) => void;
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    setPreviewDevice: (device: 'desktop' | 'tablet' | 'smartphone') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isEssentialMode: boolean;
    setIsEssentialMode: (mode: boolean) => void;
    isPreviewStacked: boolean;
    setIsPreviewStacked: (stacked: boolean) => void;
    handleApplyGlobalChanges: () => void;
}

export const ThemeSidebarHeader: React.FC<ThemeSidebarHeaderProps> = ({
    viewMode, setViewMode,
    isDirty, setIsSaveModalOpen,
    previewDevice, setPreviewDevice,
    searchQuery, setSearchQuery,
    isEssentialMode, setIsEssentialMode,
    isPreviewStacked, setIsPreviewStacked,
    handleApplyGlobalChanges
}) => {
    return (
        <div className="p-5 pb-4 shrink-0 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center">
                        <Zap className="text-white w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10px] font-black text-[var(--theme-text)] tracking-tight uppercase">
                        Design Engine <span className="text-[var(--theme-primary)] ml-0.5 opacity-50">v14.0</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 p-0.5 bg-[var(--theme-layer)] rounded-lg border border-[var(--theme-border)]">
                        {(['preview', 'catalog', 'templates'] as const).map((m) => (
                            <SarakIconButton
                                key={m}
                                onClick={() => setViewMode(m)}
                                variant={viewMode === m ? 'primary' : 'ghost'}
                                size="sm"
                                icon={m === 'preview' ? <Monitor size={10} /> : m === 'catalog' ? <Table size={10} /> : <FileJson size={10} />}
                            />
                        ))}
                    </div>

                    <SarakButton
                        onClick={() => setIsSaveModalOpen(true)}
                        disabled={!isDirty}
                        variant={isDirty ? 'secondary' : 'ghost'}
                        size="xs"
                        title={isDirty ? "Você possui alterações não salvas" : "Nenhuma alteração"}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">{isDirty ? 'Salvar' : 'Salvo'}</span>
                    </SarakButton>
                </div>
            </div>

            {/* Device Switcher (Responsive Engine) */}
            <div className="flex bg-[var(--theme-layer)] rounded-xl border border-[var(--theme-border)] p-1 mb-4">
                {([
                    { id: 'desktop', icon: Monitor, label: 'Desktop' },
                    { id: 'tablet', icon: Tablet, label: 'Tablet' },
                    { id: 'smartphone', icon: Smartphone, label: 'Mobile' }
                ] as const).map((device) => (
                    <SarakButton
                        key={device.id}
                        onClick={() => setPreviewDevice(device.id)}
                        variant={previewDevice === device.id ? 'primary' : 'ghost'}
                        size="xs"
                        leftIcon={<device.icon size={12} />}
                        className="flex-1"
                    >
                        {device.label}
                    </SarakButton>
                ))}
            </div>

            {/* Busca e Toggle Essencial */}
            <div className="flex flex-col gap-3 mb-4">
                <div className="relative group">
                    <Search size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)] group-focus-within:text-[var(--theme-primary)] transition-all" />
                    <input
                        type="text"
                        placeholder="BUSCAR TOKEN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl py-2.5 pl-9 pr-4 text-[9px] font-black tracking-widest uppercase focus:outline-none focus:border-[var(--theme-primary)]/50 transition-all text-[var(--theme-text)] placeholder:text-[var(--theme-muted)]"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsEssentialMode(!isEssentialMode);
                        }}
                    >
                        <div className={`w-6 h-3 rounded-full relative transition-all ${!isEssentialMode ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-[var(--theme-text)] transition-all ${!isEssentialMode ? 'left-3.5' : 'left-0.5'}`} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--theme-muted)] group-hover:text-[var(--theme-text)]">Modo Avançado (Hyper-Granular)</span>
                    </label>

                    <label
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsPreviewStacked(!isPreviewStacked);
                        }}
                    >
                        <div className={`w-6 h-3 rounded-full relative transition-all ${isPreviewStacked ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-[var(--theme-text)] transition-all ${isPreviewStacked ? 'left-3.5' : 'left-0.5'}`} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--theme-muted)] group-hover:text-[var(--theme-text)]">Empilhar Previews</span>
                    </label>
                </div>
            </div>

            <SarakButton
                onClick={handleApplyGlobalChanges}
                variant="primary"
                fullWidth
                size="md"
                leftIcon={<Check size={12} />}
            >
                Aplicar Alterações Globais
            </SarakButton>
        </div>
    );
};
