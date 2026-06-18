import React, { lazy } from 'react';
import { SarakTable, SarakCardGrid, SarakStats, SarakChart, SarakForm, SarakManagementGrid, SarakChat, SarakSecurityOrchestrator, SarakAuthScreen, SarakCatalogGrid } from '../../../components/atomic/Templates';
import { VisualContract, DiscoveredModule } from '../types';
import LazyEngineWrapper from '../../../components/engines/LazyEngineWrapper';
import { getSarakModule } from '../registry';
import { SarakExpandableMatrixEngine } from './SarakExpandableMatrixEngine';

const SarakChartEngine = lazy(() => import('../../../components/engines/charts/SarakChartEngine'));
const SarakFlowEngine = lazy(() => import('../../../components/engines/flows/SarakFlowEngine'));
const SarakChatEngine = lazy(() => import('../../../components/engines/chat/SarakChatEngine'));

export const ContractRenderer: React.FC<{
    contractsToRender: VisualContract[];
    resolveEndpoint: (endpointKey: string) => string;
    module?: DiscoveredModule;
}> = ({ contractsToRender, resolveEndpoint, module }) => {
    return (
        <div className="space-y-12">
            {contractsToRender.map((contract) => {
                const { type, endpoint, label, mapping, id } = contract;
                const resolvedEndpoint = resolveEndpoint(endpoint);

                switch (type) {
                    case 'TABLE':
                        return <SarakTable key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} role={contract.role} density={contract.density} /> as any;
                    
                    case 'CARD_GRID':
                        return <SarakCardGrid key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping as any} filters={contract.filters} importance={contract.importance} role={contract.role} />;
                    
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
                                role={contract.role}
                            />
                        );

                    case 'STATS':
                        return <SarakStats key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} importance={contract.importance} />;

                    case 'CHART':
                        return <SarakChart key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} role={contract.role} /> as any;

                    case 'FORM':
                        return <SarakForm key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping as any} actions={contract.actions as any} density={contract.density} /> as any;

                    
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

                    case 'SECURITY_ORCHESTRATOR':
                        return (
                            <SarakSecurityOrchestrator 
                                key={id} 
                                endpoint={resolvedEndpoint} 
                                label={label} 
                                config={(contract as any).config} 
                            />
                        );

                    case 'AUTH_FLOW':
                        return (
                            <SarakAuthScreen 
                                key={id} 
                                branding={(contract as any).branding}
                                isRegistering={(contract as any).isRegistering}
                                setIsRegistering={(contract as any).setIsRegistering}
                                mfaStep={(contract as any).mfaStep}
                                setMfaStep={(contract as any).setMfaStep}
                                username={(contract as any).username}
                                setUsername={(contract as any).setUsername}
                                password={(contract as any).password}
                                setPassword={(contract as any).setPassword}
                                mfaCode={(contract as any).mfaCode}
                                setMfaCode={(contract as any).setMfaCode}
                                showPassword={(contract as any).showPassword}
                                setShowPassword={(contract as any).setShowPassword}
                                error={(contract as any).error}
                                isPending={(contract as any).isPending}
                                onSubmit={(contract as any).onSubmit}
                                onSocialLogin={(contract as any).onSocialLogin}
                                socialConfig={(contract as any).socialConfig}
                                onForgot={(contract as any).onForgot}
                                onMasterLogin={(contract as any).onMasterLogin}
                            />
                        );

                    case 'EXPANDABLE_MATRIX':
                        return <SarakExpandableMatrixEngine key={id} contract={contract} resolveEndpoint={resolveEndpoint} />;

                    case 'CATALOG_GRID':
                        return (
                            <SarakCatalogGrid 
                                key={id} 
                                items={(contract as any).items || []}
                                loading={(contract as any).loading}
                                title={label}
                                subtitle={(contract as any).subtitle}
                                categories={(contract as any).categories}
                                onSync={(contract as any).onSync}
                                renderCard={(contract as any).renderCard}
                                emptyMessage={(contract as any).emptyMessage}
                            />
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
};
