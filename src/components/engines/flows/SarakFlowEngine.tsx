import React from 'react';
import ReactFlow, {
    Background, Controls, MiniMap,
    BackgroundVariant, Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

// Deriva os contratos diretamente do componente ReactFlow (fonte única).
type ReactFlowProps = React.ComponentProps<typeof ReactFlow>;

export interface SarakFlowEngineProps {
    /** Nós fornecidos ao React Flow; obrigatório, sem lista padrão. Use `[]` para iniciar sem nós. */
    nodes: NonNullable<ReactFlowProps['nodes']>;
    /** Conexões existentes fornecidas ao React Flow; obrigatório, sem lista padrão. Use `[]` quando não houver conexões. */
    edges: NonNullable<ReactFlowProps['edges']>;
    /** Recebe novas conexões criadas na tela; omitida, os nós e as conexões existentes continuam visíveis, mas não há callback do consumidor para persistir novas ligações. */
    onConnect?: ReactFlowProps['onConnect'];
}

/** Padrão do grid de fundo por `flowGridStyle`; valor desconhecido cai em pontos (o padrão do token). */
const GRID_VARIANTS: Record<string, (typeof BackgroundVariant)[keyof typeof BackgroundVariant]> = {
    dots: BackgroundVariant.Dots,
    lines: BackgroundVariant.Lines,
};

/** Véu da cor de texto do tema (grade, máscara): aparece sobre a superfície nos dois modos. */
const TEXT_TINT_5 = 'color-mix(in srgb, var(--text-main, #ffffff) 5%, transparent)';

/**
 * Sarak Flow Engine v7.0
 * Interactive node-based logic engine powered by ReactFlow.
 */
const SarakFlowEngine: React.FC<SarakFlowEngineProps> = ({ nodes, edges, onConnect }) => {
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
                    variant={GRID_VARIANTS[String(flowGridStyle)] ?? BackgroundVariant.Dots} 
                    gap={24} 
                    size={1} 
                    color={TEXT_TINT_5}
                />
                <Controls className="bg-theme-tint border-theme-tint-hover text-[var(--text-main,#ffffff)] fill-[var(--text-main,#ffffff)]" />
                <MiniMap 
                    style={{ backgroundColor: 'color-mix(in srgb, var(--sarak-card-bg, rgba(15, 23, 42, 0.6)) 50%, transparent)', borderRadius: 'var(--sarak-layout-gap-md,16px)' }}
                    nodeColor={() => primaryColor}
                    maskColor={TEXT_TINT_5}
                />
                <Panel position="top-right" className="bg-[var(--theme-card)] p-2 rounded-lg border border-theme-tint backdrop-blur-md">
                    <span className="text-2xs font-bold uppercase tracking-widest text-[var(--text-muted,#94a3b8)]">Flow Optimizer Active</span>
                </Panel>
            </ReactFlow>

            <style>{`
                .react-flow__node {
                    border-radius: var(--sarak-flow-node-radius, ${flowNodeRadius || 12}px);
                    background: color-mix(in srgb, var(--sarak-card-bg, var(--theme-card, rgba(15, 23, 42, 0.6))) 80%, transparent);
                    border: var(--sarak-border-width, 1px) solid color-mix(in srgb, var(--text-main, #ffffff) 10%, transparent);
                    color: var(--text-main, #ffffff);
                    font-size: var(--sarak-type-scale-xs, 11px);
                    padding: var(--sarak-flow-node-padding, 10px);
                    backdrop-filter: blur(var(--sarak-flow-node-blur, 5px));
                }
                .react-flow__handle {
                    width: var(--sarak-flow-handle-size, 8px);
                    height: var(--sarak-flow-handle-size, 8px);
                    background: ${primaryColor};
                    border: var(--sarak-border-width, 1px) solid var(--sarak-bg-base, #0a0a0c);
                }
                .react-flow__edge-path {
                    stroke: color-mix(in srgb, var(--text-main, #ffffff) 20%, transparent);
                    stroke-width: 2;
                }
            `}</style>
        </div>
    );
};

export default SarakFlowEngine;

