import React from 'react';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { SarakAnalyticalPage } from '../../../../components/Layout/SarakAnalyticalPage';
import { DashboardHeader } from './Dashboard/DashboardHeader';
import { DashboardSidePanel } from './Dashboard/DashboardSidePanel';
import { DashboardMetricsGrid } from './Dashboard/DashboardMetricsGrid';

interface MockDashboardProps {
  tokens?: any;
  config?: any;
  animationVariants?: any;
  animationStyle?: string;
}

export const MockDashboard: React.FC<MockDashboardProps> = ({ tokens }) => {
  const { variables } = useDesignVariables(tokens);
  const textureType = tokens?.cardTextureType || 'none';

  // Dados mockados
  const items = {
    cpu: { title: "CPU Cluster", subtitle: "Node-04-PR", context: "42000", input_caps: ["Vision", "Chat"] },
    health: { title: "System Health", subtitle: "Optimal Core", context: "95000", input_caps: ["Web"] },
    search: { title: "Busca de Sistema", subtitle: "Filtro de Comando", placeholder: "Digite o comando..." },
    anomaly: {
      title: "Anomaly Radar", subtitle: "Sector D-12", description: "Unusual thermal variation detected.",
      // Pares rótulo/valor genéricos do painel expansível (Spec 40 §2.5) — já
      // formatados aqui, como qualquer consumidor real faria (a Sarak não faz
      // aritmética/formatação de domínio).
      details: [
        { label: "Custo In (1M)", value: "$0.0015" },
        { label: "Custo Out (1M)", value: "$0.0020" },
      ],
    }
  };

  const mappings = {
    cpu: { title: "title", subtitle: "subtitle", context: "context", input_caps: "input_caps", icon: "Cpu" },
    health: { title: "title", subtitle: "subtitle", context: "context", input_caps: "input_caps", icon: "Shield" },
    search: { title: "title", subtitle: "subtitle", placeholder: "placeholder", icon: "Search" },
    anomaly: { title: "title", subtitle: "subtitle", description: "description", icon: "AlertTriangle", details: "details" }
  };

  const mainContentNode = (
    <div className="w-full min-h-full bg-transparent font-sans text-slate-200">
      <DashboardHeader />
      <DashboardMetricsGrid 
        tokens={tokens} 
        variables={variables} 
        textureType={textureType} 
        items={items} 
        mappings={mappings} 
      />
    </div>
  );

  return (
    <SarakAnalyticalPage 
        mainContent={mainContentNode}
        sidePanel={<DashboardSidePanel variables={variables} textureType={textureType} />}
    />
  );
};
