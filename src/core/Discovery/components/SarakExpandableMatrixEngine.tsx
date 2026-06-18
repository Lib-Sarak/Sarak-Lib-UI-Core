import React from 'react';
import { SarakExpandableMatrix } from '../../../components/atomic/Templates';
import { VisualContract } from '../types';
import { useExpandableMatrixEngine } from './hooks/useExpandableMatrixEngine';

export const SarakExpandableMatrixEngine: React.FC<{ 
    contract: VisualContract, 
    resolveEndpoint: (e: string) => string 
}> = ({ contract, resolveEndpoint }) => {
    const config = contract.config || {};
    
    const mainEndpoint = resolveEndpoint(contract.endpoint);
    const subItemsEndpoint = resolveEndpoint(config.subItemsEndpoint);

    const { data, subItems, loading, handleToggle, activeMapping } = useExpandableMatrixEngine(config, mainEndpoint, subItemsEndpoint, resolveEndpoint);

    if (loading) return (
        <div className="p-20 flex flex-col items-center justify-center gap-4 text-white/10">
            <div className="w-12 h-12 border-4 border-white/5 border-t-[var(--theme-primary)] rounded-full animate-spin" />
            <span className="text-2xs font-black uppercase tracking-[0.3em]">Sincronizando Matriz...</span>
        </div>
    );

    return (
        <SarakExpandableMatrix 
            data={data}
            subItems={subItems}
            activeMapping={activeMapping}
            onToggle={handleToggle}
        />
    );
};
