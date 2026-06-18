import { useDimensionGuard } from './useDimensionGuard';
import { useVisualSafetyGate } from './useVisualSafetyGate';

interface DimensionGuardProps {
    activeModuleId: string | null;
}

export function useShellDiagnostics({ activeModuleId }: DimensionGuardProps) {
    // --- DIMENSION GUARD (v10.1.10 Industrial Diagnostic) ---
    const { isReady, contentRef, dimensions } = useDimensionGuard(activeModuleId);
    useVisualSafetyGate();

    return {
        isReady,
        contentRef,
        dimensions
    };
}
