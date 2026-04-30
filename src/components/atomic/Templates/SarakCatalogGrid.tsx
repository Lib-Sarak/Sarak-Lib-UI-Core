import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Filter,
    LayoutGrid,
    XCircle,
    Database,
    Zap,
    Binary
} from 'lucide-react';

interface CatalogItem {
    id: string;
    display_name: string;
    organization?: string;
    category?: string;
    description?: string;
    [key: string]: any;
}

interface SarakCatalogGridProps {
    items: CatalogItem[];
    loading?: boolean;
    title: string;
    subtitle?: string;
    categories?: Record<string, string>;
    onSync?: () => void;
    renderCard?: (item: CatalogItem) => React.ReactNode;
    emptyMessage?: string;
}

/**
 * SarakCatalogGrid (Industrial Template v9.5)
 * 
 * Template soberano para catálogos, grids de produtos ou modelos.
 * Centraliza lógica de busca e filtragem visual.
 */
export const SarakCatalogGrid: React.FC<SarakCatalogGridProps> = ({
    items,
    loading,
    title,
    subtitle,
    categories = { all: 'Todos' },
    onSync,
    renderCard,
    emptyMessage = "Nenhum item encontrado."
}) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = (item.display_name + (item.organization || '') + item.id).toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, selectedCategory]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-theme-primary/10 border-t-theme-primary rounded-full animate-spin"></div>
                    <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-theme-primary/40" size={24} />
                </div>
                <p className="text-theme-muted text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    Carregando Catálogo...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header & Filter Section */}
            <section className="relative p-10 bg-theme-card border border-theme-border rounded-[3rem] overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <LayoutGrid size={240} />
                </div>

                <div className="relative z-10 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 text-theme-primary mb-3">
                            <Binary size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sarak Catalog Engine</span>
                        </div>
                        <h1 className="text-4xl font-black text-theme-text tracking-tighter">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-theme-muted text-sm mt-2 max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-theme-primary transition-colors" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Buscar..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sarak-glass bg-theme-body/30 border border-theme-border rounded-2xl py-4 pl-16 pr-6 text-theme-text text-sm focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary outline-none transition-all"
                                />
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(categories).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            selectedCategory === key 
                                            ? 'bg-theme-primary text-theme-text border-theme-primary shadow-xl shadow-theme-primary/20 scale-105' 
                                            : 'bg-theme-body/30 text-theme-muted border-theme-border hover:border-theme-primary/50'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-theme-border">
                            <div className="text-[10px] text-theme-muted font-bold uppercase tracking-widest">
                                {filteredItems.length} Itens encontrados
                            </div>
                            {(search || selectedCategory !== 'all') && (
                                <button 
                                    onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                                    className="text-theme-muted hover:text-red-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                                >
                                    <XCircle size={14} /> Limpar Filtros
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Grid */}
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <div key={item.id}>
                                {renderCard ? renderCard(item) : (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-theme-card border border-theme-border rounded-[2rem] p-6 hover:border-theme-primary/30 transition-all"
                                    >
                                        <h3 className="text-lg font-bold text-theme-text">{item.display_name}</h3>
                                        <p className="text-sm text-theme-muted mt-2">{item.organization}</p>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-theme-border rounded-[3rem]">
                    <p className="text-theme-muted font-black uppercase tracking-widest">{emptyMessage}</p>
                </div>
            )}

            {onSync && (
                <div className="fixed bottom-10 right-10 z-50">
                    <button 
                        onClick={onSync}
                        className="px-8 py-4 bg-theme-primary text-theme-text font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Sincronizar
                    </button>
                </div>
            )}
        </div>
    );
};
