import React from 'react';
import { Search, Check } from 'lucide-react';
import { ModelRoute } from './types';

interface ModelPickerProps {
  availableModels: ModelRoute[];
  selectedRoute: ModelRoute | null;
  setSelectedRoute: (route: ModelRoute) => void;
  modelSearch: string;
  setModelSearch: (search: string) => void;
  setShowModelPicker: (show: boolean) => void;
}

export const ModelPicker: React.FC<ModelPickerProps> = ({
  availableModels,
  selectedRoute,
  setSelectedRoute,
  modelSearch,
  setModelSearch,
  setShowModelPicker
}) => (
  <div className="absolute bottom-full left-0 mb-3 w-80 bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50">
    <div className="p-3">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text"
          placeholder="Pesquisar modelos..."
          value={modelSearch}
          onChange={(e) => setModelSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[var(--theme-primary-border)] text-slate-200"
        />
      </div>
      <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
        {availableModels
          .filter(m => m.display_name.toLowerCase().includes(modelSearch.toLowerCase()))
          .map((m, idx) => (
          <button
            key={idx}
            onClick={() => { setSelectedRoute(m); setShowModelPicker(false); }}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
              selectedRoute?.model === m.model ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary)]' : 'hover:bg-white/5 text-slate-400'
            }`}
          >
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-xs font-bold truncate w-full">{m.display_name}</span>
              <span className="text-2xs opacity-60 uppercase tracking-tighter">{m.provider}</span>
            </div>
            {selectedRoute?.model === m.model && <Check size={14} />}
          </button>
        ))}
      </div>
    </div>
  </div>
);

