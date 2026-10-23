import React from 'react';
import * as ReactFlowModule from 'reactflow';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakStyle } from '../../../core/Provider/components/SarakStyle';
import { SarakOptionalPeerFallback } from '../../atomic/Feedback/SarakOptionalPeerFallback';

const ReactFlow = ReactFlowModule.default;
const { Background, Controls, MiniMap, Panel } = ReactFlowModule;
const ReactFlowBackgroundVariant = ReactFlowModule.BackgroundVariant;
const OPTIONAL_PEER = 'reactflow';

const hasReactFlowPeer = (): boolean => Boolean(
    ReactFlow && Background && Controls && MiniMap && Panel && ReactFlowBackgroundVariant,
);

if (hasReactFlowPeer()) {
    void import('reactflow/dist/style.css').catch((error: unknown) => {
        console.error('[SarakFlowEngine] Could not load the React Flow stylesheet.', error);
    });
}

// Deriva os contratos diretamente do componente ReactFlow (fonte única).
type ReactFlowProps = React.ComponentProps<typeof ReactFlow>;
type FlowBackgroundVariant = React.ComponentProps<typeof Background>['variant'];

export interface SarakFlowEngineProps {
    /** Nós fornecidos ao React Flow; obrigatório, sem lista padrão. Use `[]` para iniciar sem nós. */
    nodes: NonNullable<ReactFlowProps['nodes']>;
    /** Conexões existentes fornecidas ao React Flow; obrigatório, sem lista padrão. Use `[]` quando não houver conexões. */
    edges: NonNullable<ReactFlowProps['edges']>;
    /** Recebe novas conexões criadas na tela; omitida, os nós e as conexões existentes continuam visíveis, mas não há callback do consumidor para persistir novas ligações. */
    onConnect?: ReactFlowProps['onConnect'];
}

/** Padrão do grid de fundo por `flowGridStyle`; valor desconhecido cai em pontos (o padrão do token). */
const GRID_VARIANTS: Record<string, FlowBackgroundVariant> = {
    dots: 'dots' as FlowBackgroundVariant,
    lines: 'lines' as FlowBackgroundVariant,
};

/** Véu da cor de texto do tema (grade, máscara): aparece sobre a superfície nos dois modos. */
const TEXT_TINT_5 = 'color-mix(in srgb, var(--text-main, #f2f6fb) 5%, transparent)';

/**
 * Sarak Flow Engine v7.0
 * Interactive node-based logic engine powered by ReactFlow.
 */
const SarakFlowContent: React.FC<SarakFlowEngineProps> = ({ nodes, edges, onConnect }) => {
    const { design } = useSarakUI();
    const { primaryColor, flowGridStyle, flowNodeRadius } = design || {};

    return (
        <div className="w-full h-full min-h-[var(--sarak-engine-min-h-lg,500px)] bg-[var(--theme-card)]/10 rounded-[var(--radius-theme)] border border-theme-tint overflow-hidden relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onConnect={onConnect}
                fitView
                className="sarak-flow-instance"
            >
                <Background 
                    variant={GRID_VARIANTS[String(flowGridStyle)] ?? ('dots' as FlowBackgroundVariant)}
                    gap={24} 
                    size={1} 
                    color={TEXT_TINT_5}
                />
                <Controls className="bg-theme-tint border-theme-tint-hover text-[var(--text-main,#f2f6fb)] fill-[var(--text-main,#f2f6fb)]" />
                <MiniMap 
                    style={{ backgroundColor: 'color-mix(in srgb, var(--sarak-card-bg, #101622) 50%, transparent)', borderRadius: 'var(--sarak-layout-gap-md,16px)' }}
                    nodeColor={() => primaryColor}
                    maskColor={TEXT_TINT_5}
                />
                <Panel position="top-right" className="bg-[var(--theme-card)] p-2 rounded-lg border border-theme-tint backdrop-blur-md">
                    <span className="text-2xs font-bold uppercase tracking-widest text-[var(--text-muted,rgba(242,246,251,0.55))]">Flow Optimizer Active</span>
                </Panel>
            </ReactFlow>

            <SarakStyle>{`
                .react-flow__node {
                    border-radius: var(--sarak-flow-node-radius, ${flowNodeRadius || 12}px);
                    background: color-mix(in srgb, var(--sarak-card-bg, var(--theme-card, #101622)) 80%, transparent);
                    border: var(--sarak-border-width, 1px) solid color-mix(in srgb, var(--text-main, #f2f6fb) 10%, transparent);
                    color: var(--text-main, #f2f6fb);
                    font-size: var(--sarak-type-scale-xs, 11px);
                    padding: var(--sarak-flow-node-padding, 10px);
                    backdrop-filter: blur(var(--sarak-flow-node-blur, 5px));
                }
                .react-flow__handle {
                    width: var(--sarak-flow-handle-size, 8px);
                    height: var(--sarak-flow-handle-size, 8px);
                    background: ${primaryColor};
                    border: var(--sarak-border-width, 1px) solid var(--sarak-bg-base, #06080d);
                }
                .react-flow__edge-path {
                    stroke: color-mix(in srgb, var(--text-main, #f2f6fb) 20%, transparent);
                    stroke-width: 2;
                }
            `}</SarakStyle>
        </div>
    );
};

const SarakFlowEngine: React.FC<SarakFlowEngineProps> = (props) => {
    if (!hasReactFlowPeer()) {
        return <SarakOptionalPeerFallback component="SarakFlowEngine" packages={[OPTIONAL_PEER]} />;
    }
    return <SarakFlowContent {...props} />;
};

export default SarakFlowEngine;

