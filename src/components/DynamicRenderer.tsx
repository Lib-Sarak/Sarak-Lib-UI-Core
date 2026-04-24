import React, { lazy } from 'react';
import { motion } from 'framer-motion';
import { SarakTable, SarakCardGrid, SarakStats, SarakChart, SarakForm, SarakManagementGrid, SarakChat } from '../ui';
import { VisualContract, DiscoveredModule } from '../constants/discovery';
import { getSarakModule } from '../shared/registry';
import { AlertCircle } from 'lucide-react';
import LazyEngineWrapper from './engines/LazyEngineWrapper';

// --- SARAK PRIME V7.0 ENGINES (LAZY) ---
const SarakChartEngine = lazy(() => import('./engines/charts/SarakChartEngine'));
const SarakFlowEngine = lazy(() => import('./engines/flows/SarakFlowEngine'));
const SarakChatEngine = lazy(() => import('./engines/chat/SarakChatEngine'));

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
    
    // Helper function to resolve endpoints (v6.8)
    const resolveEndpoint = React.useCallback((endpointKey: string) => {
        if (!module) return endpointKey;
        
        // 1. Resolve via dot-notation (v1.models)
        if (endpointKey && endpointKey.includes('.')) {
            const [version, key] = endpointKey.split('.');
            const versionMap = (module.endpoints as any)?.[version];
            if (versionMap && versionMap[key]) {
                const path = versionMap[key];
                return `${module.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
            }
        }
(module.endpoints as any)?.[endpointKey];
        // 2. Resolve via direct key in endpoints
        const directPath = (module.endpoints as any)?.[endpointKey];
        if (directPath) {
            return `${module.baseUrl}${directPath.startsWith('/') ? directPath : '/' + directPath}`;
        }

        // 3. Fallback: If starts with /, use baseUrl + path
        if (endpointKey && endpointKey.startsWith('/')) {
            return `${module.baseUrl}${endpointKey}`;
        }

        return endpointKey;
    }, [module]);

    // Group contracts by tabs (v6.1)
    const tabs = React.useMemo(() => {
        const groups: Record<string, VisualContract[]> = {};
        let hasTabs = false;

        contracts.forEach(c => {
            const tabName = c.tab || 'General';
            if (c.tab) hasTabs = true;
            if (!groups[tabName]) groups[tabName] = [];
            groups[tabName].push(c);
        });

        return { groups, hasTabs, names: Object.keys(groups) };
    }, [contracts]);

    const [activeTab, setActiveTab] = React.useState(tabs.names[0]);

    if (!contracts || contracts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-white/20 border border-white/5 border-dashed rounded-[3rem]">
                <AlertCircle size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-black uppercase tracking-widest">No Visual Contracts Defined</p>
            </div>
        );
    }

    const renderContracts = (contractsToRender: VisualContract[]) => (
        <div className="space-y-12">
            {contractsToRender.map((contract) => {
                const { type, endpoint, label, mapping, id } = contract;
                const resolvedEndpoint = resolveEndpoint(endpoint);

                switch (type) {
                    case 'TABLE':
                        return <SarakTable key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} />;
                    
                    case 'CARD_GRID':
                        return <SarakCardGrid key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping as any} filters={contract.filters} />;
                    
                    case 'MANAGEMENT_GRID':
                        return (
                            <SarakManagementGrid 
                                key={id} 
                                endpoint={resolvedEndpoint} 
                                groupBy={contract.groupBy || ''} 
                                mapping={mapping as any}
                                ghostGroups={contract.ghostGroups}
                                headerActions={contract.headerActions as any}
                                groupActions={contract.groupActions as any}
                                formMapping={contract.formMapping}
                            />
                        );

                    case 'STATS':
                        return <SarakStats key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} />;

                    case 'CHART':
                        return <SarakChart key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} />;

                    case 'FORM':
                        return <SarakForm key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping as any} actions={contract.actions as any} />;

                    
                    case 'CHAT_INTERFACE':
                        return (
                            <SarakChat 
                                key={id} 
                                endpoint={resolvedEndpoint || ''} 
                                label={label}
                            />
                        );

                    case 'ADVANCED_CHAT':
                        return (
                            <LazyEngineWrapper key={id}>
                                <SarakChatEngine 
                                    messages={[]} 
                                    onSendMessage={() => {}} 
                                    isLoading={false}
                                />
                            </LazyEngineWrapper>
                        );

                    case 'ELITE_CHART':
                        return (
                            <LazyEngineWrapper key={id}>
                                <SarakChartEngine 
                                    type={contract.mapping?.type as any || 'line'} 
                                    data={[]} 
                                    config={contract.mapping} 
                                />
                            </LazyEngineWrapper>
                        );

                    case 'FLOW_DIAGRAM':
                        return (
                            <LazyEngineWrapper key={id}>
                                <SarakFlowEngine 
                                    nodes={[]} 
                                    edges={[]} 
                                />
                            </LazyEngineWrapper>
                        );

                    case 'CUSTOM':
                        const componentName = contract.component || '';
                        // 1. Tentar pegar do contexto do módulo (se injetado)
                        let CustomComponent = (module as any)?.components?.[componentName];
                        
                        // 2. Fallback: Tentar pegar do Registro Global pelo ID do módulo
                        if (!CustomComponent && module?.id) {
                            const registered = getSarakModule(module.id);
                            CustomComponent = registered?.components?.[componentName];
                        }

                        if (CustomComponent) {
                            return <CustomComponent key={id} {...contract.config} />;
                        }
                        return (
                            <div key={id} className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 text-xs">
                                Component "{componentName}" not found in module registration (ID: {module?.id || 'unknown'}).
                            </div>
                        );

                    default:
                        return (
                            <div key={id} className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-amber-500 text-xs">
                                Template "{type}" not recognized by UI-Core.
                            </div>
                        );
                }
            })}
        </div>
    );

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
                                className={`relative px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
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
                    ? renderContracts(tabs.groups[activeTab])
                    : renderContracts(contracts)
                }
            </div>
        </motion.div>
    );
};

export default DynamicRenderer;
