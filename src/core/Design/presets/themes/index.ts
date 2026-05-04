import { IndustrialClassic } from './industrial-classic';
import { QuantumGlass } from './quantum-glass';
import { NeoBrutalistMatrix } from './neo-brutalist';
import { AuroraEthereal } from './aurora-ethereal';
import { MonolithicExecutive } from './monolithic-executive';
import { CyberVoid } from './cyber-void';
import { SteelHorizon } from './steel-horizon';

export const GLOBAL_THEMES: any[] = [
    {
        id: 'classic',
        name: 'Industrial Classic',
        description: 'Precisão e elegância sóbria com DNA Sarak v12.0',
        tokens: IndustrialClassic
    },
    {
        id: 'quantum',
        name: 'Quantum Glass',
        description: 'Estética futurista translúcida com foco em profundidade',
        tokens: QuantumGlass
    },
    {
        id: 'neobrutalist',
        name: 'Neo-Brutalist Matrix',
        description: 'Contraste audacioso, tipografia mono e bordas agressivas',
        tokens: NeoBrutalistMatrix
    },
    {
        id: 'aurora',
        name: 'Aurora Ethereal',
        description: 'Fluidez orgânica, mesh gradients e desfoque onírico',
        tokens: AuroraEthereal
    },
    {
        id: 'executive',
        name: 'Monolithic Executive',
        description: 'Design premium focado em modo claro e tipografia clássica',
        tokens: MonolithicExecutive
    },
    {
        id: 'cybervoid',
        name: 'Cyber-Void',
        description: 'Navegação por Dock e imersão neon em negros absolutos',
        tokens: CyberVoid
    },
    {
        id: 'steel',
        name: 'Steel Horizon',
        description: 'Alta densidade de informação e texturas de engenharia',
        tokens: SteelHorizon
    }
];

export { 
    IndustrialClassic, 
    QuantumGlass, 
    NeoBrutalistMatrix, 
    AuroraEthereal, 
    MonolithicExecutive, 
    CyberVoid, 
    SteelHorizon 
};
