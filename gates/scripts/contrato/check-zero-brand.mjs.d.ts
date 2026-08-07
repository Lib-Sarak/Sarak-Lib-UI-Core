export interface ZeroBrandViolation {
    file: string;
    line: number;
    literal: string;
}

export interface ZeroBrandResult {
    violations: ZeroBrandViolation[];
    staleAllowlist: string[];
    scannedCount: number;
}

export declare const runZeroBrandCheck: () => ZeroBrandResult;
