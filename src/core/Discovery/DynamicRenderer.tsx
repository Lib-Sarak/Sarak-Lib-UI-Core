import React from 'react';
import { motion } from 'framer-motion';
import { VisualContract, DiscoveredModule } from '../../core/Discovery/types';
import { getSarakModule } from './registry';
import { AlertCircle } from 'lucide-react';
import { useEndpointResolver } from './hooks/useEndpointResolver';
import { ContractRenderer } from './components/ContractRenderer';

interface DynamicRendererProps {
    contracts: VisualContract[];
    module?: DiscoveredModule; // Optional module context injection (v6.8)
}

/**
 * DynamicRenderer (v6.0-6.8 Smart Router)
 * 
 * The UI-Core rendering engine. It receives a list of visual contracts
 * and builds the interface dynamically without prior knowledge
 * of the module's specifics.
 */

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ contracts, module }) => {
    
    // 1. Root Component Sovereignty (v9.3)
    // Buscamos o componente físico pelo ID do módulo se ele não estiver no objeto.
    const registryMod = module?.id ? getSarakModule(module.id) : undefined;
    const RootComponent = module?.component || registryMod?.component;
    
    // Helper function to resolve endpoints (v6.8)
    const resolveEndpoint = useEndpointResolver(module);

    // Group contracts by tabs (v6.1)
    const tabs = React.useMemo(() => {
        const groups: Record<string, VisualContract[]> = {};
        let hasTabs = false;

        contracts?.forEach(c => {
            const tabName = c.tab || 'General';
            if (c.tab) hasTabs = true;
            if (!groups[tabName]) groups[tabName] = [];
            groups[tabName].push(c);
        });

        return { groups, hasTabs, names: Object.keys(groups) };
    }, [contracts]);

    const [activeTab, setActiveTab] = React.useState(tabs.names[0] || 'General');

    // Se tivermos um componente raiz, ele assume o controle total da tela
    if (RootComponent) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full"
            >
                <RootComponent module={module} />
            </motion.div>
        );
    }

    if (!contracts || contracts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-white/20 border border-white/5 border-dashed rounded-[3rem]">
                <AlertCircle size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-black uppercase tracking-widest">No Visual Contracts Defined</p>
                {module && <p className="text-[10px] mt-2 opacity-30">Module ID: {module.id}</p>}
            </div>
        );
    }


    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Tab Navigation (v6.1) */}
            {tabs.hasTabs && (
                <div className="flex justify-center mb-12">
                    <nav className="flex p-1.5 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
                        {tabs.names.map(name => (
                            <button
                                key={name}
                                onClick={() => setActiveTab(name)}
                                className={`relative px-8 py-3.5 rounded-[1.5rem] text-2xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                                    activeTab === name ? 'text-white' : 'text-white/30 hover:text-white/60'
                                }`}
                            >
                                {activeTab === name && (
                                    <motion.div 
                                        layoutId="activeTabMarker"
                                        className="absolute inset-0 bg-primary-600 rounded-[1.5rem] shadow-lg shadow-primary-500/20"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {tabs.hasTabs 
                    ? <ContractRenderer contractsToRender={tabs.groups[activeTab]} resolveEndpoint={resolveEndpoint} module={module} />
                    : <ContractRenderer contractsToRender={contracts} resolveEndpoint={resolveEndpoint} module={module} />
                }
            </div>
        </motion.div>
    );
};

export default DynamicRenderer;

