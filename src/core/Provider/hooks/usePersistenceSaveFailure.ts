import { useCallback, useState } from 'react';

interface PersistenceSaveFailureState {
    failureCount: number;
    recordFailure: () => void;
}

/** Mantém a contagem de falhas de gravação isolada por instância do Provider. */
export const usePersistenceSaveFailure = (): PersistenceSaveFailureState => {
    const [failureCount, setFailureCount] = useState(0);
    const recordFailure = useCallback(() => setFailureCount((count) => count + 1), []);

    return { failureCount, recordFailure };
};
