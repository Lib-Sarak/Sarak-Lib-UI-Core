import React from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { Edit3, X, Command, Search, Filter } from 'lucide-react';
import { SarakInput } from '../../../components/atomic/Inputs';
import { useShortcutsManager } from './hooks/useShortcutsManager';

const Kbd = ({ children, isEditing = false }: { children: React.ReactNode, isEditing?: boolean }) => (
    <kbd className={`px-2 py-1.5 bg-black/40 text-2xs font-black font-mono rounded-lg border shadow-sm uppercase tracking-widest inline-flex items-center justify-center min-w-[28px] transition-all ${isEditing ? 'border-blue-500 text-blue-400 animate-pulse bg-blue-500/10' : 'border-white/10 text-white/60'}`}>
        {children}
    </kbd>
);

const formatKeyName = (key: string) => {
    if (key === ' ') return 'Space';
    if (key === 'Control') return 'Ctrl';
    return key.charAt(0).toUpperCase() + key.slice(1);
};

export const ShortcutsTab: React.FC = () => {
    const sarak = useSarakUI();
    
    const {
        state,
        shortcutsArray,
        groupedShortcuts,
        startEditing,
        cancelEditing,
        setSearchQuery
    } = useShortcutsManager(sarak);

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
            {/* Toolbar */}
            <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                <div className="flex-1 max-w-sm">
                    <SarakInput 
                        placeholder="Buscar ação ou categoria..." 
                        value={state.searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-2xs font-black uppercase tracking-widest">
                        {shortcutsArray.length} Ações Registradas
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-8 pt-6 space-y-8">
                {Object.entries(groupedShortcuts).map(([cat, items]: [string, any]) => (
                    <div key={cat} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Filter className="w-3.5 h-3.5 text-white/20" />
                            <h3 className="text-2xs font-black uppercase tracking-[0.2em] text-white/30 italic">{cat}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {items.map((s: any) => {
                                const isEd = state.editingId === s.id;
                                const keys = isEd ? (state.tempKeys.length > 0 ? [...state.tempKeys, '...'] : ['AGUARDANDO...']) : (s.keys || []);
                                
                                return (
                                    <div key={s.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isEd ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/20 shadow-lg shadow-blue-900/20' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 group'}`}>
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isEd ? 'text-blue-400' : 'text-white/80 group-hover:text-white'}`}>{s.description}</span>
                                            <span className="text-2xs text-white/30 font-medium uppercase tracking-tighter italic">{s.id}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                {keys.map((k: string, i: number) => (
                                                    <React.Fragment key={i}>
                                                        <Kbd isEditing={isEd}>{formatKeyName(k)}</Kbd>
                                                        {i < keys.length - 1 && <span className="text-white/20 text-2xs font-black">+</span>}
                                                    </React.Fragment>
                                                ))}
                                            </div>

                                            <div className={`flex items-center gap-1 transition-all duration-300 ${isEd ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                {isEd ? (
                                                    <button onClick={cancelEditing} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => startEditing(s.id)} className="p-2 rounded-xl text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {Object.keys(groupedShortcuts).length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                        <Command className="w-12 h-12" />
                        <div className="text-2xs font-black uppercase tracking-widest">Nenhuma ação encontrada</div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 text-center">
                <p className="text-2xs text-white/30 uppercase font-black tracking-widest">
                    Pressione <Kbd>ESC</Kbd> para cancelar a edição
                </p>
            </div>
        </div>
    );
};

export default ShortcutsTab;
