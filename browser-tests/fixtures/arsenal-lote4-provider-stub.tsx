import React, { createContext, useContext } from 'react';
import { sarakGetDefaultDesignState } from '../../src/core/Design/master-map';
import { useDesignVariables } from '../../src/core/Design/hooks/useDesignVariables';

interface MeasurementProviderProps {
    config?: Record<string, unknown>;
    children: React.ReactNode;
}

interface MeasurementContext {
    design: Record<string, unknown>;
}

const MeasurementContext = createContext<MeasurementContext | null>(null);
export const UIContext = MeasurementContext;

export function useSarakUIOptional(): MeasurementContext | null {
    return useContext(MeasurementContext);
}

export function useSarakUI(): MeasurementContext {
    const context = useSarakUIOptional();
    if (!context) throw new Error('O caso de medição requer SarakUIProvider.');
    return context;
}

export function SarakUIProvider({ config = {}, children }: MeasurementProviderProps): React.ReactElement {
    const design = { ...sarakGetDefaultDesignState(), ...config };
    const { variables } = useDesignVariables(design);

    return (
        <MeasurementContext.Provider value={{ design }}>
            <div style={variables as React.CSSProperties}>{children}</div>
        </MeasurementContext.Provider>
    );
}
