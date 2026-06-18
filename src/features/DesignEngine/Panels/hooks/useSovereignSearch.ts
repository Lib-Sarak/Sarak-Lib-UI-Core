import { useMemo } from 'react';
import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { Fingerprint, Type, Layout, Waves, MousePointer2, Cpu } from 'lucide-react';

export const SOVEREIGN_PILLARS = [
    { id: 'core', label: 'Fundação (DNA)', icon: Fingerprint, schemas: ['identity'] },
    { id: 'typo', label: 'Semântica Texto', icon: Type, schemas: ['typography'] },
    { id: 'body', label: 'Arquitetura UI', icon: Layout, schemas: ['shell', 'cards'] },
    { id: 'vibe', label: 'Atmosfera (Vibe)', icon: Waves, schemas: ['atmosphere', 'animations'] },
    { id: 'action', label: 'Fluxo & Input', icon: MousePointer2, schemas: ['controls'] },
    { id: 'system', label: 'Core Engine', icon: Cpu, schemas: ['specialized', 'data', 'system'] },
];

export const useSovereignSearch = (draft: any, searchQuery: string, activePillar: string) => {
    // IDENTIFICA QUAIS PILARES POSSUEM DRAFTS ATIVOS
    const pillarsWithDrafts = useMemo(() => {
        const changedKeys = Object.keys(draft);
        return SOVEREIGN_PILLARS.filter(pillar => {
            const pillarTokens = MASTER_DESIGN_MAP.components
                .filter(c => pillar.schemas.includes(c.id))
                .flatMap(c => c.tokens.map(t => t.id));
            return changedKeys.some(key => pillarTokens.includes(key));
        }).map(p => p.id);
    }, [draft]);

    // FILTRAGEM INTELIGENTE (BUSCA OU PILAR)
    const filteredComponents = useMemo(() => {
        const query = searchQuery.toLowerCase();
        
        // Se houver busca, ignora os pilares e mostra tudo que der match
        if (query) {
            return MASTER_DESIGN_MAP.components.map(comp => {
                const tokens = comp.tokens.filter(token => 
                    token.label.toLowerCase().includes(query) || 
                    token.id.toLowerCase().includes(query)
                );
                
                if (tokens.length > 0 || comp.label.toLowerCase().includes(query)) {
                    return { ...comp, tokens: tokens.length > 0 ? tokens : comp.tokens };
                }
                return null;
            }).filter(Boolean) as typeof MASTER_DESIGN_MAP.components;
        }

        // Se não houver busca, filtra pelo pilar ativo
        const currentPillar = SOVEREIGN_PILLARS.find(p => p.id === activePillar);
        if (!currentPillar) return [];

        return MASTER_DESIGN_MAP.components.filter(comp => 
            currentPillar.schemas.includes(comp.id)
        );
    }, [searchQuery, activePillar]);

    return { pillarsWithDrafts, filteredComponents, SOVEREIGN_PILLARS };
};
