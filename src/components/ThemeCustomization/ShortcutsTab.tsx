import { useSarakUI } from '../SarakUIProvider';
import { Keyboard, Edit3, X, RotateCcw, Plus, Trash2, Command, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Kbd = ({ children, isEditing = false }: { children: React.ReactNode, isEditing?: boolean }) => (
    <kbd className={`px-2 py-1.5 bg-black/40 text-[10px] font-black font-mono rounded-lg border shadow-sm uppercase tracking-widest inline-flex items-center justify-center min-w-[28px] transition-all ${isEditing ? 'border-blue-500 text-blue-400 animate-pulse bg-blue-500/10' : 'border-white/10 text-white/60'}`}>
        {children}
    </kbd>
);

const formatKeyName = (key: string) => {
    if (key === ' ') return 'Space';
    if (key === 'Control') return 'Ctrl';
    return key.charAt(0).toUpperCase() + key.slice(1);
};

export const ShortcutsTab: React.FC = () => {
    const { effective: sarak, applyFullConfig } = useSarakUI();
    
    // Extração segura de propriedades de atalhos
    const shortcuts = (sarak as any).shortcuts || [];
    const registeredActions = (sarak as any).registeredActions || {};
    const updateShortcut = (sarak as any).updateShortcut || ((id: string, keys: string[]) => {
        console.warn('UpdateShortcut não disponível em modo Standalone');
        // Fallback: tentar atualizar via config genérica se houver suporte futuro
        applyFullConfig({ _shortcutUpdate: { id, keys } });
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempKeys, setTempKeys] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [domActions, setDomActions] = useState<any>({});

    useEffect(() => {
        const elements = document.querySelectorAll('[data-action-id]');
        const found: any = {};
        elements.forEach(el => {
            const id = el.getAttribute('data-action-id');
            if (id) {
                found[id] = { 
                    id, 
                    name: el.getAttribute('data-action-name') || id, 
                    category: el.getAttribute('data-action-category') || 'Interface', 
                    isDom: true 
                };
            }
        });
        setDomActions(found);
    }, []);

    const allAvailableActions: any = { ...registeredActions, ...domActions };
    
    // Convert shortcuts to array for mapping
    const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : Object.values(shortcuts || {});
    
    const filteredShortcuts = shortcutsArray.filter((s: any) => 
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedShortcuts = filteredShortcuts.reduce((acc: any, s: any) => {
        (acc[s.category] = acc[s.category] || []).push(s);
        return acc;
    }, {});

    const startEditing = (id: string) => {
        setEditingId(id);
        setTempKeys([]);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setTempKeys([]);
        setIsCreating(false);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!editingId) return;
        
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'Escape') {
            cancelEditing();
            return;
        }

        const newKeys: string[] = [];
        if (e.ctrlKey) newKeys.push('Control');
        if (e.shiftKey) newKeys.push('Shift');
        if (e.altKey) newKeys.push('Alt');
        if (e.metaKey) newKeys.push('Meta');

        const isModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);
        if (!isModifier) newKeys.push(e.key);

        setTempKeys(newKeys);

        if (!isModifier && newKeys.length > 0) {
            updateShortcut(editingId, newKeys);
            setEditingId(null);
            setTempKeys([]);
        }
    }, [editingId, updateShortcut]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [handleKeyDown]);

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
            {/* Toolbar */}
            <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-4 py-2 rounded-2xl w-full max-w-sm group focus-within:border-blue-500/50 transition-all">
                    <Search className="w-4 h-4 text-white/20 group-focus-within:text-blue-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar ação ou categoria..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-white/70 w-full placeholder:text-white/10 uppercase font-black tracking-widest"
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
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
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">{cat}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {items.map((s: any) => {
                                const isEd = editingId === s.id;
                                const keys = isEd ? (tempKeys.length > 0 ? [...tempKeys, '...'] : ['AGUARDANDO...']) : (s.keys || []);
                                
                                return (
                                    <div key={s.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isEd ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/20 shadow-lg shadow-blue-900/20' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 group'}`}>
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${isEd ? 'text-blue-400' : 'text-white/80 group-hover:text-white'}`}>{s.description}</span>
                                            <span className="text-[9px] text-white/30 font-medium uppercase tracking-tighter italic">{s.id}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                {keys.map((k: string, i: number) => (
                                                    <React.Fragment key={i}>
                                                        <Kbd isEditing={isEd}>{formatKeyName(k)}</Kbd>
                                                        {i < keys.length - 1 && <span className="text-white/20 text-[10px] font-black">+</span>}
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
                        <div className="text-[10px] font-black uppercase tracking-widest">Nenhuma ação encontrada</div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 text-center">
                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">
                    Pressione <Kbd>ESC</Kbd> para cancelar a edição
                </p>
            </div>
        </div>
    );
};

export default ShortcutsTab;
