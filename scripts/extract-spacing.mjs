import { resolve } from 'path';
import { readFileSync } from 'fs';

// Uma heurística simples baseada no regex nos arquivos JSON de src/core/Design/schema
// para localizar os tokens de espaçamento.

import { execSync } from 'child_process';
const result = execSync('grep -r -A 5 -B 5 "spacing" src/core/Design/schema/', { encoding: 'utf-8' });
console.log(result);
