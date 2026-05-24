import { MASTER_DESIGN_MAP } from '../src/core/Design/master-map';
import * as fs from 'fs';

const tokens: Record<string, any> = {};

MASTER_DESIGN_MAP.components.forEach(comp => {
    comp.tokens.forEach(token => {
        tokens[token.id] = token.defaultValue;
    });
});

console.log(JSON.stringify(tokens, null, 4));
