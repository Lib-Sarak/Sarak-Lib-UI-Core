// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// É um wrapper fino (nome `auditor_*` exigido por `buildDevState.mjs`, mesmo
// padrão de `auditor_sectionpointers.mjs`/`auditor_presets.mjs`) — a lógica
// real e os limites declarados estão em `verify_contrast.ts`, que precisa de
// `npx tsx` para importar `GLOBAL_THEMES`/`getDefaultDesignState` direto da
// fonte TypeScript.
// -------------------------------------------------------------------------
import { execSync } from 'child_process';
import path from 'path';

console.log('--- Auditor de Contraste WCAG AA (R31) ---');
console.log('Invocando o verificador (verify_contrast.ts)...\n');

const verifyScript = path.resolve('gates/scripts/audit/verify_contrast.ts');

try {
  execSync(`npx tsx "${verifyScript}"`, { stdio: 'inherit' });
  process.exit(0);
} catch (error) {
  process.exit(error.status || 1);
}
