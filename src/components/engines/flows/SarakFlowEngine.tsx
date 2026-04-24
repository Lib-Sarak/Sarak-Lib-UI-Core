import React from 'react';
import ReactFlow, { 
    Background, Controls, MiniMap, 
    BackgroundVariant, Panel 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

interface SarakFlowEngineProps {
    nodes: any[];
    edges: any[];
    onConnect?: (params: any) => void;
}

/**
 * Sarak Flow Engine v7.0
 * Interactive node-based logic engine powered by ReactFlow.
 */
const SarakFlowEngine: React.FC<SarakFlowEngineProps> = ({ nodes, edges, onConnect }) => {
    const { design } = useSarakUI();
    const { primaryColor, mode, flowGridStyle, flowNodeRadius } = design || {};

    return (
        <div className="w-full h-full min-h-[500px] bg-[var(--theme-card)]/10 rounded-[var(--radius-theme)] border border-white/5 overflow-hidden relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onConnect={onConnect}
                fitView
                className="sarak-flow-instance"
            >
                <Background 
                    variant={flowGridStyle === 'lines' ? BackgroundVariant.Lines : BackgroundVariant.Dots} 
                    gap={24} 
                    size={1} 
                    color={mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 
                />
                <Controls className="bg-white/5 border-white/10 text-white fill-white" />
                <MiniMap 
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '12px' }}
                    nodeColor={() => primaryColor}
                    maskColor="rgba(255,255,255,0.05)"
                />
                <Panel position="top-right" className="bg-[var(--theme-card)] p-2 rounded-lg border border-white/5 backdrop-blur-md">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Flow Optimizer Active</span>
                </Panel>
            </ReactFlow>

            <style>{`
                .react-flow__node {
                    border-radius: ${flowNodeRadius || 12}px;
                    background: rgba(15, 15, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 11px;
                    padding: 10px;
                    backdrop-filter: blur(5px);
                }
                .react-flow__handle {
                    width: 8px;
                    height: 8px;
                    background: ${primaryColor};
                    border: 2px solid white;
                }
                .react-flow__edge-path {
                    stroke: rgba(255, 255, 255, 0.2);
                    stroke-width: 2;
                }
            `}</style>
        </div>
    );
};

export default SarakFlowEngine;
