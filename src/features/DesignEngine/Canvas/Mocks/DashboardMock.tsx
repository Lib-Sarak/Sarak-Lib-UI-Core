import React from 'react';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { SarakTitleCard } from '../../../../components/atomic/Cards/SarakTitleCard';
import { SarakSearchCard } from '../../../../components/atomic/Cards/SarakSearchCard';
import { SarakActionCard } from '../../../../components/atomic/Cards/SarakActionCard';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

interface MockDashboardProps {
  tokens?: any;
  config?: any;
  animationVariants?: any;
  animationStyle?: string;
}

export const MockDashboard: React.FC<MockDashboardProps> = ({ tokens }) => {
  // Gera as variáveis CSS atômicas baseadas nos tokens atuais
  const { variables } = useDesignVariables(tokens);
  
  // Classe base e atributos para os cards reativos
  const cardBaseClass = "sarak-card flex flex-col gap-4 overflow-hidden relative transition-all duration-500";
  const textureType = tokens?.cardTextureType || 'none';
  
  // Componentes atômicos com dados para injeção no Gêmeo Digital
  const cpuItem = {
    title: "CPU Cluster",
    subtitle: "Node-04-PR",
    context: "42000",
    input_caps: ["Vision", "Chat"]
  };
  const cpuMapping = {
    title: "title",
    subtitle: "subtitle",
    context: "context",
    input_caps: "input_caps",
    icon: "Cpu"
  };

  const healthItem = {
    title: "System Health",
    subtitle: "Optimal Core",
    context: "95000",
    input_caps: ["Web"]
  };
  const healthMapping = {
    title: "title",
    subtitle: "subtitle",
    context: "context",
    input_caps: "input_caps",
    icon: "Shield"
  };

  const searchItem = {
    title: "Busca de Sistema",
    subtitle: "Filtro de Comando",
    placeholder: "Digite o comando..."
  };
  const searchMapping = {
    title: "title",
    subtitle: "subtitle",
    placeholder: "placeholder",
    icon: "Search"
  };

  const anomalyItem = {
    title: "Anomaly Radar",
    subtitle: "Sector D-12",
    description: "Unusual thermal variation detected. Monitoring active.",
    price_in: "0.0015",
    price_out: "0.0020"
  };
  const anomalyMapping = {
    title: "title",
    subtitle: "subtitle",
    description: "description",
    icon: "AlertTriangle"
  };

  // Helper para renderizar card com injeção técnica
  const SmartCard = ({ children, className = "", style = {}, label }: any) => {
    const globalUI = useSarakUI();
    return (
      <div 
        className={`${cardBaseClass} ${className}`}
        style={{ ...variables, ...style } as any}
        data-sx-card-texture-type={textureType}
      >
        {globalUI?.isDrafting && label && (
            <div className="absolute top-2 left-4 z-40 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-[var(--theme-primary)]/20 text-[7px] font-black uppercase tracking-[0.2em] text-[var(--theme-primary)] shadow-[0_0_10px_rgba(0,242,255,0.05)]">
                <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                {label}
            </div>
        )}
        {/* Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col gap-inherit">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 w-full min-h-full bg-transparent font-sans text-slate-200">
      {/* HEADER OPERACIONAL */}
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight uppercase italic text-white">Digital Twin OS</h1>
          </div>
          <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">
            Operational Intelligence // System Live // Node-04-PR
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Uptime</p>
            <p className="text-sm font-mono text-[var(--theme-primary)]">99.998%</p>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Protocol</p>
            <p className="text-sm font-mono" style={{ color: 'var(--theme-secondary, var(--theme-primary))' }}>SX-SEC-12</p>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL DE ALTA DENSIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
        
        {/* ROW 1: TELEMETRIA DE INFRAESTRUTURA (MICRO-CARDS - MAIORES) */}
        <SarakTitleCard 
          item={cpuItem}
          mapping={cpuMapping}
          design={tokens}
          className="md:col-span-3"
          label="Card de Título (CPU Cluster)"
        />

        <SarakSearchCard 
          item={searchItem}
          mapping={searchMapping}
          design={tokens}
          className="md:col-span-3"
          label="Card de Interação (Busca)"
        />

        <SmartCard className="md:col-span-3 p-5 md:p-6 !gap-4" label="Card de Métricas (Latency)">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">Latency</span>
            <SarakIcon name="Activity" size={14} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-mono text-white">14ms</span>
            <span className="text-[10px] text-[var(--theme-primary)] mb-1 font-bold">Stable</span>
          </div>
          <div className="flex gap-1 h-6 items-end">
             {[30, 45, 20, 60, 40, 25, 35, 50, 45, 30, 20, 40].map((h, i) => (
               <div key={i} className="flex-1 bg-white/10 rounded-t-[1px]" style={{ height: `${h}%` }} />
             ))}
          </div>
        </SmartCard>

        <SarakTitleCard 
          item={healthItem}
          mapping={healthMapping}
          design={tokens}
          className="md:col-span-3"
          label="Card de Título (Health)"
        />

        {/* ROW 2: CORE OPERATIONS (CHART + LIVE FEED - MAIORES) */}
        <SmartCard className="md:col-span-8 h-[420px] p-5 md:p-6 lg:p-8" label="Card de Gráficos (Data Flow)">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Data Flow Engine</h3>
              <p className="text-[10px] text-slate-600 font-mono">PACKET PROCESSING REAL-TIME</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[var(--theme-primary-bg)] text-[var(--theme-primary)] text-[9px] font-bold border border-[var(--theme-primary-border)] uppercase tracking-tighter">Channel-08-X</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-3 pb-4">
            {[40, 60, 35, 55, 45, 75, 40, 85, 95, 65, 50, 70].map((height, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-[var(--theme-primary)]/20 to-[var(--theme-primary)]/80 rounded-t-lg transition-all hover:scale-110 cursor-pointer group relative" style={{ height: `${height}%` }}>
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[8px] font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {height}%
                 </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-[9px] text-slate-600 font-mono uppercase">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>24:00</span>
          </div>
        </SmartCard>

        <SmartCard className="md:col-span-4 h-[420px] p-5 md:p-6 lg:p-8" label="Card de Texto (Logs)">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Activity</h3>
            <SarakIcon name="Clock" size={14} className="text-slate-600" />
          </div>
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { time: '2m ago', type: 'System', msg: 'Security Protocol Updated', color: 'var(--theme-primary)' },
              { time: '12m ago', type: 'Warning', msg: 'Latency Spike in Node D-1', color: 'var(--theme-warning, var(--theme-primary))' },
              { time: '45m ago', type: 'AI', msg: 'New Model Injected: GPT-4o', color: 'var(--theme-secondary, var(--theme-primary))' },
              { time: '1h ago', type: 'Security', msg: 'SSH Breach Attempt Blocked', color: 'var(--theme-error, var(--theme-primary))' },
              { time: '2h ago', type: 'Ops', msg: 'Sync with Cloud Cluster Complete', color: 'rgb(100, 116, 139)' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className="w-1 h-8 rounded-full opacity-40 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">{item.type}</span>
                    <span className="text-[9px] font-mono text-slate-600 italic">{item.time}</span>
                  </div>
                  <p className="text-xs text-white/80 leading-snug tracking-tight">{item.msg}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2 bg-white/5 hover:bg-white/10 transition-colors text-[9px] font-bold uppercase tracking-widest text-slate-400 border border-white/5 rounded">
            View All History
          </button>
        </SmartCard>
               {/* ROW 3: LOGISTICS & SECURITY (INVENTORY + ACCESS - MAIORES) */}
        <SmartCard className="md:col-span-4 p-5 md:p-6 lg:p-8" label="Card de Ação (Inventory)">
           <div className="flex items-center gap-4 mb-4">
             <SarakIcon name="Package" size={20} className="text-[var(--theme-primary)]" />
             <h3 className="text-sm font-bold text-white uppercase italic tracking-wider">Inventory Flow</h3>
           </div>
           <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                   <span className="text-slate-400 uppercase">Primary Stock</span>
                   <span className="text-[var(--theme-primary)]">85% - SAFE</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-[var(--theme-primary)]/40 w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                   <span className="text-slate-400 uppercase">Critical Parts</span>
                   <span style={{ color: 'var(--theme-error, var(--theme-primary))' }}>12% - ALERT</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-[12%]" style={{ backgroundColor: 'rgba(var(--theme-error-rgb, 239, 68, 68), 0.4)' }} />
                </div>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-4 rounded border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">In Transit</p>
                    <p className="text-xl font-mono text-white tracking-tighter">24</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pending</p>
                    <p className="text-xl font-mono text-white tracking-tighter">08</p>
                 </div>
              </div>
           </div>
        </SmartCard>

        <SmartCard className="md:col-span-5 !p-0" label="Card de Tabela (Access)">
           <div className="p-5 pb-3 md:p-8 md:pb-4 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <SarakIcon name="Shield" size={20} className="text-[var(--theme-primary)]" />
                <h3 className="text-sm font-bold text-white uppercase italic tracking-wider">Access Control</h3>
             </div>
             <SarakIcon name="Search" size={16} className="text-slate-600" />
           </div>
           <div className="px-5 pb-5 md:px-8 md:pb-8">
              <table className="w-full text-[11px] font-mono text-slate-400">
                 <thead>
                    <tr className="text-left border-b border-white/5">
                       <th className="pb-3 font-bold uppercase tracking-wider">Identity</th>
                       <th className="pb-3 font-bold uppercase tracking-wider">Sector</th>
                       <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {[
                      { user: 'Igor Sarak', sector: 'R&D Lab', status: 'Authorized', color: 'var(--theme-primary)' },
                      { user: 'Alpha Node', sector: 'Server Room', status: 'Active', color: 'var(--theme-secondary, var(--theme-primary))' },
                      { user: 'Unknown', sector: 'Main Gate', status: 'Warning', color: 'var(--theme-warning, var(--theme-primary))' },
                      { user: 'Support-01', sector: 'Office', status: 'Authorized', color: 'var(--theme-primary)' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 text-white/90 font-medium">{row.user}</td>
                        <td className="py-4 uppercase italic text-[10px]">{row.sector}</td>
                        <td className="py-4 font-bold" style={{ color: row.color }}>{row.status}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </SmartCard>

        <SarakActionCard 
          item={anomalyItem}
          mapping={anomalyMapping}
          design={tokens}
          className="md:col-span-3 h-full"
          onAction={() => alert("Acknowledge Action Executed!")}
          label="Card de Interação (Radar)"
        />

        {/* ROW 4: ENVIRONMENT & INFRA (TERMOMETERS + POWER - MAIORES) */}
        <SmartCard className="md:col-span-3 p-5 md:p-6 lg:p-8" label="Card de Métricas (Ambiente)">
           <div className="flex justify-between mb-6">
             <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Environment</span>
             <SarakIcon name="Thermometer" size={16} style={{ color: 'var(--theme-error, var(--theme-primary))' }} />
           </div>
           <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-3xl font-mono text-white italic tracking-tighter">24.2°C</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ambient Temp</p>
                 </div>
                 <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[60%]" style={{ backgroundColor: 'rgba(var(--theme-error-rgb, 239, 68, 68), 0.5)' }} />
                 </div>
              </div>
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-3xl font-mono text-white italic tracking-tighter">42%</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Humidity</p>
                 </div>
                 <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[42%]" style={{ backgroundColor: 'rgba(var(--theme-secondary-rgb, 112, 0, 255), 0.5)' }} />
                 </div>
              </div>
           </div>
        </SmartCard>

        <SmartCard className="md:col-span-4 p-5 md:p-6 lg:p-8" label="Card de Métricas (Energia)">
           <div className="flex justify-between mb-6">
             <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Energy Grid</span>
             <SarakIcon name="Zap" size={16} style={{ color: 'var(--theme-warning, var(--theme-primary))' }} />
           </div>
           <div className="flex items-center gap-8">
              <div className="flex-1 space-y-5">
                 <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
                       <span>Consumption</span>
                       <span className="text-white font-mono">1.2kW</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[65%]" style={{ backgroundColor: 'rgba(var(--theme-warning-rgb, 245, 158, 11), 0.4)' }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
                       <span>Phase Stability</span>
                       <span className="text-[var(--theme-primary)] font-mono">99.8%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-[var(--theme-primary)]/40 w-[99%]" />
                    </div>
                 </div>
              </div>
              <div className="w-[1px] h-16 bg-white/10" />
              <div className="text-center px-2">
                 <p className="text-3xl font-mono text-white tracking-tighter">88</p>
                 <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest leading-none">Grid<br/>Load</p>
              </div>
           </div>
        </SmartCard>

        <SmartCard className="md:col-span-5 p-5 md:p-6 lg:p-8 overflow-visible" label="Card de Interação (Terminal)">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Operational Commands</h3>
              <SarakIcon name="Terminal" size={16} className="text-[var(--theme-primary)]" />
           </div>
           <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1 bg-black/40 border border-white/5 p-5 rounded-lg font-mono text-[11px] text-[var(--theme-primary)]/80 relative group min-w-0">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                   <span className="text-white/70 font-bold uppercase tracking-tighter">NODE_PROMPT_WAITING...</span>
                 </div>
                 <p className="text-white/40 mb-1">&gt; fetch_sync_data --target=alpha</p>
                 <p className="text-[var(--theme-primary)]/60">&gt; SUCCESS: DATA_STREAM_OPEN</p>
                 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-white/10 rounded-md"><SarakIcon name="Settings" size={12} /></button>
                 </div>
              </div>
              <div className="flex xl:flex-col gap-3 shrink-0">
                 <button className="flex-1 xl:flex-initial px-6 py-3 bg-[var(--theme-primary)] text-black text-[10px] font-black uppercase rounded shadow-lg shadow-[var(--theme-primary)]/20 hover:scale-105 transition-transform active:scale-95">Deploy</button>
                 <button className="flex-1 xl:flex-initial px-6 py-3 bg-white/5 text-white text-[10px] font-bold uppercase rounded border border-white/10 hover:bg-white/10 transition-colors">Abort</button>
              </div>
           </div>
         </SmartCard>

        {/* ROW 5: ACTIVE PIPELINES TABLE & CLUSTER METRICS */}
        <SmartCard className="md:col-span-6 p-5 md:p-6 lg:p-8" label="Card de Tabela (Pipelines)">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <SarakIcon name="Database" size={18} className="text-[var(--theme-primary)]" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Pipelines Ativos</h3>
                <p className="text-[9px] text-slate-600 font-mono">NODE PIPELINE DATABASES</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-mono border border-emerald-500/20">
              ALL OK
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono text-slate-400">
              <thead>
                <tr className="text-left border-b border-white/5 pb-2">
                  <th className="pb-2 font-bold uppercase tracking-wider text-slate-500">Pipeline</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-slate-500 text-center">Fluxo</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-slate-500 text-center">Latência</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'Core.Sync.Service', rate: '14.2k/s', latency: '4ms', status: 'Syncing', color: 'var(--theme-primary)' },
                  { name: 'NLP.Ingress.Queue', rate: '8.4k/s', latency: '12ms', status: 'Optimal', color: 'var(--theme-secondary, var(--theme-primary))' },
                  { name: 'Auth.Verify.Router', rate: '920/s', latency: '1.5ms', status: 'Idle', color: 'rgb(148, 163, 184)' },
                  { name: 'Log.Drain.Storage', rate: '3.1k/s', latency: '35ms', status: 'Active', color: 'var(--theme-primary)' }
                ].map((p, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 font-semibold text-white/95">{p.name}</td>
                    <td className="py-3 text-center text-white/70">{p.rate}</td>
                    <td className="py-3 text-center font-bold" style={{ color: p.color }}>{p.latency}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] uppercase text-emerald-400">{p.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SmartCard>

        <SmartCard className="md:col-span-6 p-5 md:p-6 lg:p-8" label="Card de Ação (Storage)">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <SarakIcon name="HardDrive" size={18} className="text-[var(--theme-primary)]" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Armazenamento Hot-Tier</h3>
                <p className="text-[9px] text-slate-600 font-mono">HIGH-SPEED STORAGE SYSTEM</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-mono border border-blue-500/20">
              98.2% HEALTH
            </span>
          </div>

          <div className="space-y-4 font-mono text-[11px]">
            <div>
              <div className="flex justify-between text-[10px] uppercase text-slate-400 mb-1.5 font-bold">
                <span>NVMe Array-01 (Hot Data)</span>
                <span className="text-white">428 GB / 1.0 TB</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--theme-primary)]/40 w-[42.8%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] uppercase text-slate-400 mb-1.5 font-bold">
                <span>Memory Cache Buffer</span>
                <span className="text-white">12.4 GB / 16.0 GB</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[77.5%]" style={{ backgroundColor: 'var(--theme-secondary, var(--theme-primary))' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 p-3 rounded border border-white/5 text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Read IOPS</p>
                <p className="text-sm font-bold text-white">420k</p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/5 text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Write IOPS</p>
                <p className="text-sm font-bold text-white">310k</p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/5 text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Temp</p>
                <p className="text-sm font-bold text-emerald-450" style={{ color: 'var(--theme-primary)' }}>38°C</p>
              </div>
            </div>
          </div>
        </SmartCard>

      </div>

      {/* FOOTER DO DASHBOARD */}
      <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em]">
        <div className="flex gap-6">
          <span>Encrypted: AES-256</span>
          <span>Status: Local-Only</span>
          <span>Buffer: 1024mb</span>
        </div>
        <div className="flex items-center gap-2">
          <SarakIcon name="Globe" size={10} />
          <span>Syncing with Global-Sarak-Node...</span>
        </div>
      </div>
    </div>
  );
};
