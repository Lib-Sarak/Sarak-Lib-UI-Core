import * as fs from 'fs';
import { MASTER_DESIGN_MAP } from '../src/core/Design/master-map';

const mappingRaw = fs.readFileSync('../src/core/Design/catalog/theme_table_mapping.json', 'utf8');
const mapping = JSON.parse(mappingRaw);

const tokenKeys = new Set<string>();
MASTER_DESIGN_MAP.components.forEach(comp => {
    comp.tokens.forEach(token => {
        tokenKeys.add(token.id);
    });
});

const mappedKeys = new Set<string>();
for (const [col, fields] of Object.entries(mapping)) {
    (fields as string[]).forEach(f => mappedKeys.add(f));
}

let missing = 0;
console.log(`Total tokens in code: ${tokenKeys.size}`);
console.log(`Total keys mapped: ${mappedKeys.size}`);

console.log("\nTokens missing from mapping:");
for (const key of Array.from(tokenKeys).sort()) {
    if (!mappedKeys.has(key)) {
        console.log(` - ${key}`);
        missing++;
    }
}

let extra = 0;
console.log("\nMapped keys that do not exist in code:");
for (const key of Array.from(mappedKeys).sort()) {
    if (!tokenKeys.has(key)) {
        console.log(` - ${key}`);
        extra++;
    }
}

if (missing === 0 && extra === 0) {
    console.log("\nPARITY: 100% PERFECT MATCH!");
}
