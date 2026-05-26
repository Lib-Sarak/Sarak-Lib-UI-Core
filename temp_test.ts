import { MASTER_DESIGN_MAP } from './src/core/Design/master-map.js';
import { TokenCatalog } from './src/core/Design/catalog/index.js';
import { buildDynamicGroups } from './src/features/DesignEngine/utils/dynamic-categories.js';

const groups = buildDynamicGroups(MASTER_DESIGN_MAP.components, TokenCatalog as any);
let totalTokensMapped = 0;

Object.keys(groups).forEach(pillar => {
    console.log(`Pilar: ${pillar}`);
    Object.keys(groups[pillar]).forEach(sub => {
        const count = groups[pillar][sub].length;
        console.log(`  Subcategoria: ${sub} (${count} tokens)`);
        totalTokensMapped += count;
    });
});
console.log(`\nTotal Tokens Mapped: ${totalTokensMapped}`);
