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
import { SarakInput } from '../Inputs';
import { SarakButton } from '../Buttons';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { twMerge } from 'tailwind-merge';

interface CatalogItem {
    id: string;
    display_name: string;
    organization?: string;
    category?: string;
    description?: string;
    [key: string]: unknown;
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
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
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

    const { getContainerStyles, getHeaderStyles, getGridStyles, getFlexStyles, getResponsiveStackStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();
    const headerLayout = getHeaderStyles();
    const gridLayout = getGridStyles();
    const loadingStack = getFlexStyles('column', 'center', 'center', 'var(--sarak-layout-gap-lg, 24px)');
    const innerStack = getFlexStyles('column', undefined, undefined, headerLayout.style.gap as string);
    const searchRow = getResponsiveStackStyles('lg', 'calc(var(--sarak-layout-gap-md,16px) * 1.5)');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = (item.display_name + (item.organization || '') + item.id).toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, selectedCategory]);

    if (loading) {
        return (
            <div className={`${loadingStack.className} min-h-[40vh]`} style={loadingStack.style}>
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[var(--border-color,#334155)]-primary/10 border-t-theme-primary rounded-full animate-spin"></div>
                    <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-theme-primary/40" size={24} />
                </div>
                <p className="text-theme-muted text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    Carregando Catálogo...
                </p>
            </div>
        );
    }

    return (
        <div className={twMerge(containerLayout.className)} style={{ ...containerLayout.style, paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 5)', gap: 'calc(var(--sarak-layout-gap-md,16px) * 2.5)' }}>
            {/* Header & Filter Section */}
            <section className={twMerge("relative bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)] rounded-[3rem] overflow-hidden", headerLayout.className)} style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 2.5)' }}>
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 2.5)' }}>
                    <LayoutGrid size={240} />
                </div>

                <div className={`relative z-10 ${innerStack.className}`} style={innerStack.style}>
                    <div>
                        <div className="flex items-center text-theme-primary" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}>
                            <Binary size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sarak Catalog Engine</span>
                        </div>
                        <h1 className="text-4xl font-black text-theme-text tracking-tighter">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-theme-muted text-sm max-w-2xl" style={{ marginTop: 'var(--sarak-layout-gap-sm, 8px)' }}>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className={innerStack.className} style={innerStack.style}>
                        <div className={searchRow.className} style={searchRow.style}>
                            <div className="flex-1">
                                <SarakInput 
                                    type="text"
                                    placeholder="Buscar..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    leftIcon={<Search size={16} />}
                                />
                            </div>
                            
                            <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                                {Object.entries(categories).map(([key, label]) => (
                                    <SarakButton
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        variant={selectedCategory === key ? 'primary' : 'secondary'}
                                        className={selectedCategory === key ? "shadow-xl" : ""}
                                        style={selectedCategory === key ? { boxShadow: '0 10px 20px -10px var(--sarak-shadow-glow,rgba(59,130,246,0.5))' } : {}}
                                    >
                                        {label}
                                    </SarakButton>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--border-color,#334155)]-border" style={{ paddingTop: 'var(--sarak-layout-gap-md,16px)' }}>
                            <div className="text-[10px] text-theme-muted font-bold uppercase tracking-widest">
                                {filteredItems.length} Itens encontrados
                            </div>
                            {(search || selectedCategory !== 'all') && (
                                <SarakButton 
                                    onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                                    variant="ghost"
                                    className="text-theme-muted hover:text-red-400"
                                >
                                    <XCircle size={14} /> Limpar Filtros
                                </SarakButton>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Grid */}
            {filteredItems.length > 0 ? (
                <div className={twMerge(gridLayout.className, "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")} style={gridLayout.style}>
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <div key={item.id}>
                                {renderCard ? renderCard(item) : (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)]-border rounded-[2rem] hover:border-[var(--border-color,#334155)]-primary/30 transition-all"
                                        style={{ padding: 'var(--sarak-layout-gap-lg, 24px)' }}
                                    >
                                        <h3 className="text-lg font-bold text-theme-text">{item.display_name}</h3>
                                        <p className="text-sm text-theme-muted" style={{ marginTop: 'var(--sarak-layout-gap-sm, 8px)' }}>{item.organization}</p>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center border border-dashed border-[var(--border-color,#334155)]-border rounded-[3rem]" style={{ paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 5)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 5)' }}>
                    <p className="text-theme-muted font-black uppercase tracking-widest">{emptyMessage}</p>
                </div>
            )}

            {onSync && (
                <div className="fixed bottom-10 right-10 z-50">
                    <SarakButton 
                        onClick={onSync}
                        className="shadow-2xl"
                        style={{ padding: 'var(--sarak-layout-gap-md,16px) calc(var(--sarak-layout-gap-md,16px) * 2)' }}
                    >
                        Sincronizar
                    </SarakButton>
                </div>
            )}
        </div>
    );
};
