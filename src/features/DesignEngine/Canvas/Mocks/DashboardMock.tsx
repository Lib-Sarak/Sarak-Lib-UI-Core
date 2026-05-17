import React from 'react';
import { 
  Activity, Shield, Cpu, Zap, Database, HardDrive, 
  Package, Users, AlertTriangle, MessageSquare, 
  LineChart, Eye, Settings, Terminal, Globe,
  Clock, Thermometer, Droplets, Battery, Search
} from 'lucide-react';

import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';

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
  
  // Helper para renderizar card com injeção técnica
  const SmartCard = ({ children, className = "", style = {} }: any) => {
    const hasCardTexture = textureType && textureType !== 'none';
    
    return (
      <div 
        className={`${cardBaseClass} ${className}`}
        style={{ ...variables, ...style } as any}
        data-sx-card-texture-type={textureType}
      >

        
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
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight uppercase italic text-white">Digital Twin OS</h1>
          </div>
          <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">
            Operational Intelligence // System Live // Node-04-PR
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Uptime</p>
            <p className="text-sm font-mono text-emerald-400">99.998%</p>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Protocol</p>
            <p className="text-sm font-mono text-cyan-400">SX-SEC-12</p>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL DE ALTA DENSIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
        
        {/* ROW 1: TELEMETRIA DE INFRAESTRUTURA (MICRO-CARDS - MAIORES) */}
        <SmartCard className="md:col-span-3 !p-6 !gap-4">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">CPU Cluster</span>
            <Cpu size={14} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-mono text-white">42%</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500/50 w-[42%]" />
            </div>
          </div>
        </SmartCard>

        <SmartCard className="md:col-span-3 !p-6 !gap-4">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">Memory Pool</span>
            <Database size={14} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-mono text-white">8.4GB</span>
            <span className="text-[10px] text-slate-500 mb-1">/ 16GB</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500/50 w-[52.5%]" />
          </div>
        </SmartCard>

        <SmartCard className="md:col-span-3 !p-6 !gap-4">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">Latency</span>
            <Activity size={14} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-mono text-white">14ms</span>
            <span className="text-[10px] text-emerald-400 mb-1 font-bold">Stable</span>
          </div>
          <div className="flex gap-1 h-6 items-end">
             {[30, 45, 20, 60, 40, 25, 35, 50, 45, 30, 20, 40].map((h, i) => (
               <div key={i} className="flex-1 bg-white/10 rounded-t-[1px]" style={{ height: `${h}%` }} />
             ))}
          </div>
        </SmartCard>

        <SmartCard className="md:col-span-3 !p-6 !gap-4">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">System Health</span>
            <Shield size={14} />
          </div>
          <div className="flex items-center gap-4 py-1">
             <div className="relative">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={138} strokeDashoffset={138 * 0.05} className="text-emerald-500" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">95%</div>
             </div>
             <div className="text-[11px] text-slate-400 leading-tight uppercase font-mono tracking-tighter">
                No threats detected<br/>Kernel optimized
             </div>
          </div>
        </SmartCard>

        {/* ROW 2: CORE OPERATIONS (CHART + LIVE FEED - MAIORES) */}
        <SmartCard className="md:col-span-8 h-[420px] !p-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Data Flow Engine</h3>
              <p className="text-[10px] text-slate-600 font-mono">PACKET PROCESSING REAL-TIME</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-bold border border-cyan-500/20 uppercase tracking-tighter">Channel-08-X</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-3 pb-4">
            {[40, 60, 35, 55, 45, 75, 40, 85, 95, 65, 50, 70].map((height, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/20 to-cyan-400/80 rounded-t-lg transition-all hover:scale-110 cursor-pointer group relative" style={{ height: `${height}%` }}>
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

        <SmartCard className="md:col-span-4 h-[420px] !p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Activity</h3>
            <Clock size={14} className="text-slate-600" />
          </div>
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { time: '2m ago', type: 'System', msg: 'Security Protocol Updated', color: 'bg-emerald-500' },
              { time: '12m ago', type: 'Warning', msg: 'Latency Spike in Node D-1', color: 'bg-amber-500' },
              { time: '45m ago', type: 'AI', msg: 'New Model Injected: GPT-4o', color: 'bg-cyan-500' },
              { time: '1h ago', type: 'Security', msg: 'SSH Breach Attempt Blocked', color: 'bg-rose-500' },
              { time: '2h ago', type: 'Ops', msg: 'Sync with Cloud Cluster Complete', color: 'bg-slate-500' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className={`w-1 h-8 rounded-full ${item.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
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
        <SmartCard className="md:col-span-4 !p-8">
           <div className="flex items-center gap-4 mb-4">
             <Package size={20} className="text-cyan-400" />
             <h3 className="text-sm font-bold text-white uppercase italic tracking-wider">Inventory Flow</h3>
           </div>
           <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                   <span className="text-slate-400 uppercase">Primary Stock</span>
                   <span className="text-emerald-400">85% - SAFE</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500/40 w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                   <span className="text-slate-400 uppercase">Critical Parts</span>
                   <span className="text-rose-400">12% - ALERT</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-rose-500/40 w-[12%]" />
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

        <SmartCard className="md:col-span-5 !p-0">
           <div className="p-8 pb-4 flex justify-between items-center">
             <div className="flex items-center gap-4">
               <Shield size={20} className="text-emerald-400" />
               <h3 className="text-sm font-bold text-white uppercase italic tracking-wider">Access Control</h3>
             </div>
             <Search size={16} className="text-slate-600" />
           </div>
           <div className="px-8 pb-8">
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
                      { user: 'Igor Sarak', sector: 'R&D Lab', status: 'Authorized', color: 'text-emerald-400' },
                      { user: 'Alpha Node', sector: 'Server Room', status: 'Active', color: 'text-cyan-400' },
                      { user: 'Unknown', sector: 'Main Gate', status: 'Warning', color: 'text-amber-400' },
                      { user: 'Support-01', sector: 'Office', status: 'Authorized', color: 'text-emerald-400' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 text-white/90 font-medium">{row.user}</td>
                        <td className="py-4 uppercase italic text-[10px]">{row.sector}</td>
                        <td className={`py-4 font-bold ${row.color}`}>{row.status}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </SmartCard>

        <SmartCard className="md:col-span-3 !p-8 flex flex-col justify-between">
           <div>
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Anomaly Radar</h3>
               <AlertTriangle size={16} className="text-amber-500 animate-pulse" />
             </div>
             <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-lg mb-4">
               <p className="text-[11px] font-bold text-amber-500 uppercase mb-2 tracking-widest">Sector D-12</p>
               <p className="text-xs text-amber-200/80 leading-relaxed font-medium">Unusual thermal variation detected. Monitoring active.</p>
             </div>
           </div>
           <div className="flex gap-3">
             <button className="flex-1 py-3 bg-amber-500 text-black text-[10px] font-black uppercase rounded shadow-lg shadow-amber-500/20 transition-transform active:scale-95">Acknowledge</button>
             <button className="px-4 py-3 bg-white/10 text-white text-[10px] font-bold uppercase rounded hover:bg-white/20 transition-colors">Details</button>
           </div>
        </SmartCard>

        {/* ROW 4: ENVIRONMENT & INFRA (TERMOMETERS + POWER - MAIORES) */}
        <SmartCard className="md:col-span-3 !p-8">
           <div className="flex justify-between mb-6">
             <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Environment</span>
             <Thermometer size={16} className="text-rose-400" />
           </div>
           <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-3xl font-mono text-white italic tracking-tighter">24.2°C</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ambient Temp</p>
                 </div>
                 <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500/50 w-[60%]" />
                 </div>
              </div>
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-3xl font-mono text-white italic tracking-tighter">42%</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Humidity</p>
                 </div>
                 <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500/50 w-[42%]" />
                 </div>
              </div>
           </div>
        </SmartCard>

        <SmartCard className="md:col-span-4 !p-8">
           <div className="flex justify-between mb-6">
             <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Energy Grid</span>
             <Zap size={16} className="text-amber-400" />
           </div>
           <div className="flex items-center gap-8">
              <div className="flex-1 space-y-5">
                 <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
                       <span>Consumption</span>
                       <span className="text-white font-mono">1.2kW</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500/40 w-[65%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
                       <span>Phase Stability</span>
                       <span className="text-emerald-400 font-mono">99.8%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500/40 w-[99%]" />
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

        <SmartCard className="md:col-span-5 !p-8 overflow-visible">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Operational Commands</h3>
              <Terminal size={16} className="text-cyan-400" />
           </div>
           <div className="flex gap-4">
              <div className="flex-1 bg-black/40 border border-white/5 p-5 rounded-lg font-mono text-[11px] text-cyan-400/80 relative group">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                   <span className="text-white/70 font-bold uppercase tracking-tighter">NODE_PROMPT_WAITING...</span>
                 </div>
                 <p className="text-white/40 mb-1">&gt; fetch_sync_data --target=alpha</p>
                 <p className="text-emerald-400/60">&gt; SUCCESS: DATA_STREAM_OPEN</p>
                 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-white/10 rounded-md"><Settings size={12} /></button>
                 </div>
              </div>
              <div className="flex flex-col gap-3">
                 <button className="px-6 py-3 bg-emerald-500 text-black text-[10px] font-black uppercase rounded shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform active:scale-95">Deploy</button>
                 <button className="px-6 py-3 bg-white/5 text-white text-[10px] font-bold uppercase rounded border border-white/10 hover:bg-white/10 transition-colors">Abort</button>
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
          <Globe size={10} />
          <span>Syncing with Global-Sarak-Node...</span>
        </div>
      </div>
    </div>
  );
};
