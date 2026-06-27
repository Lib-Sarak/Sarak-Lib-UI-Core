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
                        return <SarakTable key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} role={contract.role} density={contract.density} />;

                    case 'CARD_GRID':
                        return <SarakCardGrid key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping as unknown as React.ComponentProps<typeof SarakCardGrid>['mapping']} filters={contract.filters} importance={contract.importance} role={contract.role} />;
                    
                    case 'MANAGEMENT_GRID':
                        return (
                            <SarakManagementGrid 
                                key={id} 
                                endpoint={resolvedEndpoint} 
                                groupBy={contract.groupBy || ''}
                                mapping={mapping as unknown as React.ComponentProps<typeof SarakManagementGrid>['mapping']}
                                ghostGroups={contract.ghostGroups}
                                headerActions={contract.headerActions}
                                groupActions={contract.groupActions as unknown as React.ComponentProps<typeof SarakManagementGrid>['groupActions']}
                                formMapping={contract.formMapping}
                                role={contract.role}
                            />
                        );

                    case 'STATS':
                        return <SarakStats key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} importance={contract.importance} />;

                    case 'CHART':
                        return <SarakChart key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} role={contract.role} />;

                    case 'FORM':
                        return <SarakForm key={id} endpoint={resolvedEndpoint} label={label} mapping={mapping} actions={contract.actions} density={contract.density} />;

                    
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
                                    type={(contract.mapping?.type || 'line') as React.ComponentProps<typeof SarakChartEngine>['type']}
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
                                config={contract.config as React.ComponentProps<typeof SarakSecurityOrchestrator>['config']}
                            />
                        );

                    case 'AUTH_FLOW': {
                        // O contrato AUTH_FLOW é enriquecido em runtime com os props da tela de auth.
                        const c = contract as VisualContract & React.ComponentProps<typeof SarakAuthScreen>;
                        return (
                            <SarakAuthScreen
                                key={id}
                                branding={c.branding}
                                isRegistering={c.isRegistering}
                                setIsRegistering={c.setIsRegistering}
                                mfaStep={c.mfaStep}
                                setMfaStep={c.setMfaStep}
                                username={c.username}
                                setUsername={c.setUsername}
                                password={c.password}
                                setPassword={c.setPassword}
                                mfaCode={c.mfaCode}
                                setMfaCode={c.setMfaCode}
                                showPassword={c.showPassword}
                                setShowPassword={c.setShowPassword}
                                error={c.error}
                                isPending={c.isPending}
                                onSubmit={c.onSubmit}
                                onSocialLogin={c.onSocialLogin}
                                socialConfig={c.socialConfig}
                                onForgot={c.onForgot}
                                onMasterLogin={c.onMasterLogin}
                            />
                        );
                    }

                    case 'EXPANDABLE_MATRIX':
                        return <SarakExpandableMatrixEngine key={id} contract={contract} resolveEndpoint={resolveEndpoint} />;

                    case 'CATALOG_GRID': {
                        const c = contract as VisualContract & React.ComponentProps<typeof SarakCatalogGrid>;
                        return (
                            <SarakCatalogGrid
                                key={id}
                                items={c.items || []}
                                loading={c.loading}
                                title={label}
                                subtitle={c.subtitle}
                                categories={c.categories}
                                onSync={c.onSync}
                                renderCard={c.renderCard}
                                emptyMessage={c.emptyMessage}
                            />
                        );
                    }

                    case 'CUSTOM':
                        const componentName = contract.component || '';
                        // 1. Tentar pegar do contexto do módulo (se injetado)
                        let CustomComponent = module?.components?.[componentName];
                        
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
