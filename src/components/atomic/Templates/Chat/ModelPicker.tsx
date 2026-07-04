import React from 'react';
import { Search, Check } from 'lucide-react';
import { ModelRoute } from './types';
import { SarakInput } from '../../Inputs';
import { SarakButton } from '../../Buttons';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

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
}) => {
  const { getFlexStyles } = useStructuralStyles();
  const optionStack = getFlexStyles('column', undefined, 'flex-start', '0px');

  return (
    <div
      className="absolute bottom-full left-0 w-80 bg-[var(--sarak-card-bg)] border border-[var(--sarak-card-border-color)] rounded-sarak shadow-2xl backdrop-blur-2xl overflow-hidden z-50"
      style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
    >
      <div style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}>
        <div style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}>
          <SarakInput
            type="text"
            placeholder="Pesquisar modelos..."
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            leftIcon={<Search size={14} />}
            fullWidth
          />
        </div>
        <div className="max-h-60 overflow-y-auto custom-scrollbar" style={{ paddingRight: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
          {availableModels
            .filter(m => m.display_name.toLowerCase().includes(modelSearch.toLowerCase()))
            .map((m, idx) => (
            <SarakButton
              key={idx}
              onClick={() => { setSelectedRoute(m); setShowModelPicker(false); }}
              variant={selectedRoute?.model === m.model ? 'primary' : 'ghost'}
              className="w-full justify-between"
              style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}
            >
              <div className="flex overflow-hidden" style={optionStack.style}>
                <span className="text-xs font-bold truncate w-full">{m.display_name}</span>
                <span className="text-2xs opacity-60 uppercase tracking-tighter">{m.provider}</span>
              </div>
              {selectedRoute?.model === m.model && <Check size={14} />}
            </SarakButton>
          ))}
        </div>
      </div>
    </div>
  );
};
