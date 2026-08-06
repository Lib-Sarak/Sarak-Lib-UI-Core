// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// Mede AUSÊNCIA DE CHAVE ÓRFÃ em todos os temas/presets embarcados de uma
// vez — NÃO mede completude por tema (um tema que faltasse chaves, mas sem
// nenhuma órfã, passaria). Não vê tema escrito pelo consumidor.
// `verify_theme_parity.ts` cobriria completude por tema; nada o invoca hoje.
// -------------------------------------------------------------------------
import { execSync } from 'child_process';
import path from 'path';

console.log("--- Auditor de Drift de Presets/Temas ---");
console.log("Invocando o validador de Gabarito Dinâmico (verify_presets.ts)...\n");

const verifyScript = path.resolve('gates/scripts/audit/verify_presets.ts');

try {
  execSync(`npx tsx "${verifyScript}"`, { stdio: 'inherit' });
  process.exit(0);
} catch (error) {
  process.exit(error.status || 1);
}
