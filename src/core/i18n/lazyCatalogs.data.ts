import { CATALOG_ACCESS } from './catalogEntries.access';
import { CATALOG_ADVANCED } from './catalogEntries.advanced';
import { CATALOG_ENTRIES } from './catalogEntries.entries';
import { CATALOG_SYSTEM } from './catalogEntries.system';

/** Os textos das peças opcionais, num pedaço só: este módulo só é alcançado por `import()` (`lazyCatalogs.ts`). */
export const LAZY_CATALOG = {
    ...CATALOG_ENTRIES,
    ...CATALOG_SYSTEM,
    ...CATALOG_ACCESS,
    ...CATALOG_ADVANCED,
};
