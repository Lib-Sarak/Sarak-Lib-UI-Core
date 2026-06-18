import { useMemo } from 'react';
import { DiscoveredModule } from '../../../../core/Discovery/types';

export const useMockModules = () => {
    const appIds = ['dashboard', 'forms', 'documentos', 'chat', 'logs', 'settings', 'components', 'typography', 'auth', 'matrix', 'tabela', 'caixas-texto', 'graficos', 'kitchen-sink'];

    const mockDiscoveredModules = useMemo<DiscoveredModule[]>(() => {
        return appIds.map((id, index) => ({
            id,
            label: id === 'dashboard' ? 'Dashboard'
                : id === 'forms' ? 'Formulários'
                    : id === 'documentos' ? 'Documentos'
                        : id === 'chat' ? 'Chat Ops'
                            : id === 'logs' ? 'System Logs'
                                : id === 'settings' ? 'Settings'
                                    : id === 'components' ? 'Gallery'
                                        : id === 'typography' ? 'Typography'
                                            : id === 'auth' ? 'Security Gate'
                                                : id === 'matrix' ? 'Matrix Network'
                                                    : id === 'tabela' ? 'Tabela Analítica'
                                                        : id === 'caixas-texto' ? 'Caixas de Texto'
                                                            : id === 'graficos' ? 'Gráficos Avançados'
                                                                : 'Kitchen Sink',
            icon: id === 'dashboard' ? 'BarChart3'
                : id === 'forms' ? 'Layout'
                    : id === 'documentos' ? 'FileText'
                        : id === 'chat' ? 'MessageSquare'
                            : id === 'logs' ? 'History'
                                : id === 'settings' ? 'Network'
                                    : id === 'components' ? 'Box'
                                        : id === 'typography' ? 'Type'
                                            : id === 'auth' ? 'Lock'
                                                : id === 'matrix' ? 'Layers'
                                                    : id === 'tabela' ? 'Grid'
                                                        : id === 'caixas-texto' ? 'AlignLeft'
                                                            : id === 'graficos' ? 'LineChart'
                                                                : 'Zap',
            category: id === 'kitchen-sink' ? 'Experimental' : 'System Modules',
            status: 'online',
            priority: index,
        }));
    }, [appIds]);

    const mockGroupedModules = useMemo(() => {
        return mockDiscoveredModules.reduce((acc: Record<string, DiscoveredModule[]>, mod) => {
            const cat = mod.category || 'System Modules';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(mod);
            return acc;
        }, {});
    }, [mockDiscoveredModules]);

    return { mockDiscoveredModules, mockGroupedModules };
};
