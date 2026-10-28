import { createContext, useContext } from 'react';

/** Quantas colunas o `SarakGrid` pai declarou para o dispositivo ativo; `undefined` quando ele não declarou `columns`. */
const GridColumnsContext = createContext<number | undefined>(undefined);

export const GridColumnsProvider = GridColumnsContext.Provider;

export const useGridColumns = (): number | undefined => useContext(GridColumnsContext);
