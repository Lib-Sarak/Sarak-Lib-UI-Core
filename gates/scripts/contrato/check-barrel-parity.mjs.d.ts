export interface BarrelParityResult {
    missingValues: string[];
    missingProps: string[];
    staleValueExclusions: string[];
    stalePropsExclusions: string[];
    registryCount: number;
}

export declare const runBarrelParityCheck: () => BarrelParityResult;
